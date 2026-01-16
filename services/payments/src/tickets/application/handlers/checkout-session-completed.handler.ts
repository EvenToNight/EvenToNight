import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CheckoutSessionCompletedEvent } from '../../domain/events/checkout-session-completed.event';
import { TransactionManager } from '../../infrastructure/database/transaction.manager';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { TicketService } from '../services/ticket.service';
import { OrderService } from '../services/order.service';

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
//TODO: call the handler instead of triggering with event
@EventsHandler(CheckoutSessionCompletedEvent)
export class CheckoutSessionCompletedHandler implements IEventHandler<CheckoutSessionCompletedEvent> {
  private readonly logger = new Logger(CheckoutSessionCompletedHandler.name);

  constructor(
    private readonly ticketService: TicketService,
    private readonly orderService: OrderService,
    private readonly transactionManager: TransactionManager,
  ) {}

  // ========================================
  // PHASE 2: Confirm payment for all tickets (TX2)
  // ========================================
  async handle(event: CheckoutSessionCompletedEvent): Promise<void> {
    this.logger.log(
      `Handling checkout session completed: ${event.payload.sessionId}`,
    );

    const { orderId } = event.payload;
    const order = await this.orderService.findById(orderId);
    //TODO handle order not found and update order status
    if (!order) {
      this.logger.warn(`Order ${orderId} not found`);
      throw new Error(`Order ${orderId} not found`);
    }
    try {
      const confirmedTickets = await this.confirmTicketPayment(
        order.getTicketIds(),
      );
      this.logger.log(
        `Successfully confirmed ${confirmedTickets.length} tickets for session ${event.payload.sessionId}`,
      );

      //TODO: publis some TicketPurchasedEvent here?
      // ticketId, eventId, userId, attendeeName, ticketTypeId, price, currency, purchaseDate

      this.logger.log(
        `Successfully confirmed ${confirmedTickets.length} tickets for session ${event.payload.sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to confirm tickets for session ${event.payload.sessionId}`,
        error,
      );
      throw error;
    }
  }

  private async confirmTicketPayment(ticketIds: string[]): Promise<Ticket[]> {
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
      return confirmed;
    });
  }
}
