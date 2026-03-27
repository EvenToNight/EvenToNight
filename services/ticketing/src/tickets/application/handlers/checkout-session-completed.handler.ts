import { Inject, Injectable, Logger } from '@nestjs/common';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { Order } from 'src/tickets/domain/aggregates/order.aggregate';
import { TicketService } from '../services/ticket.service';
import { OrderService } from '../services/order.service';
import { OutboxService } from '@libs/nestjs-common';
import { OrderConfirmedEvent } from 'src/tickets/domain/events/order-confirmed.event';
import {
  TRANSACTION_MANAGER,
  Transactional,
  type TransactionManager,
} from '@libs/ts-common';
import { OrderNotFoundException } from 'src/tickets/domain/exceptions/order-not-found-exception';

/**
 * Handler for Checkout Session Completed Event (Saga Phase 2)
 *
 * This handler is triggered when a user successfully completes payment
 * on the Stripe hosted checkout page. It confirms all tickets from
 * PENDING_PAYMENT → ACTIVE status within a transaction.
 *
 * Flow:
 * 1. Receive CheckoutSessionCompletedEvent from webhook controller
 * 2. Update all tickets to ACTIVE status (TX2)
 * 3. Publish TicketPurchasedEvent for each confirmed ticket?
 */
@Injectable()
export class CheckoutSessionCompletedHandler {
  private readonly logger = new Logger(CheckoutSessionCompletedHandler.name);

  constructor(
    private readonly ticketService: TicketService,
    private readonly orderService: OrderService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    private readonly outboxService: OutboxService,
  ) {}

  @Transactional()
  async handle(
    sessionId: string,
    orderId: string,
    paymentIntentId: string,
  ): Promise<void> {
    this.logger.log(`Handling checkout session completed: ${sessionId}`);

    const order = await this.orderService.findById(orderId);
    if (!order) {
      throw new OrderNotFoundException(orderId);
    }
    order.setPaymentIntentId(paymentIntentId);
    await this.orderService.update(order);
    try {
      const confirmedTickets = await this.confirmTicketPaymentAndPublish(
        order.getTicketIds().map((id) => id.toString()),
        order,
      );
      this.logger.log(
        `Successfully confirmed ${confirmedTickets.length} tickets for session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to confirm tickets for session ${sessionId}`,
        error,
      );
      throw error;
    }
  }

  private async confirmTicketPaymentAndPublish(
    ticketIds: string[],
    order: Order,
  ): Promise<Ticket[]> {
    return this.transactionManager.executeInTransaction(async () => {
      const confirmed: Ticket[] = [];

      for (const ticketId of ticketIds) {
        const ticket = await this.ticketService.findById(ticketId);
        if (!ticket) {
          this.logger.warn(`Ticket ${ticketId} not found`);
          continue;
        }
        if (!ticket.isPendingPayment()) {
          this.logger.warn(
            `Ticket ${ticketId} is not in PENDING_PAYMENT status (current: ${ticket.getStatus().toString()})`,
          );
          continue;
        }
        ticket.confirmPayment();
        const updated = await this.ticketService.update(ticket);
        confirmed.push(updated);
      }

      order.complete();
      await this.orderService.update(order);

      const orderConfirmedEvent = new OrderConfirmedEvent({
        orderId: order.getId().toString(),
        userId: order.getUserId().toString(),
        eventId: order.getEventId().toString(),
      });
      await this.outboxService.addEvent(
        orderConfirmedEvent,
        orderConfirmedEvent.eventType,
      );

      return confirmed;
    });
  }
}
