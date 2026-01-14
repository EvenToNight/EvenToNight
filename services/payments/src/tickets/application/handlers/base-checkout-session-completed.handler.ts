import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { BaseCheckoutSessionCompletedEvent } from '../../domain/events/base-checkout-session-completed.event';
import type { TicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { TICKET_REPOSITORY } from '../../domain/repositories/ticket.repository.interface';
import { TransactionManager } from '../../infrastructure/database/transaction.manager';
import { EventPublisher } from '../../../commons/intrastructure/messaging/event-publisher';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { OrderService } from '../services/order.service';

@EventsHandler(BaseCheckoutSessionCompletedEvent)
export class BaseCheckoutSessionCompletedHandler implements IEventHandler<BaseCheckoutSessionCompletedEvent> {
  private readonly logger = new Logger(
    BaseCheckoutSessionCompletedHandler.name,
  );

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    private readonly transactionManager: TransactionManager,
    private readonly orderService: OrderService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  private async confirmTicketPayment(ticketIds: string[]): Promise<Ticket[]> {
    return this.transactionManager.executeInTransaction(async () => {
      const confirmed: Ticket[] = [];

      for (const ticketId of ticketIds) {
        const ticket = await this.ticketRepository.findById(ticketId);
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
        const updated = await this.ticketRepository.update(ticket);
        confirmed.push(updated);
      }
      return confirmed;
    });
  }

  // ========================================
  // PHASE 2: Confirm payment for all tickets (TX2)
  // ========================================
  async handle(event: BaseCheckoutSessionCompletedEvent): Promise<void> {
    this.logger.log(
      `Handling checkout session completed: ${event.payload.sessionId}`,
    );
    const { orderId } = event.payload;
    const order = await this.orderService.findById(orderId);
    //TODO handle order not found
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
    } catch (error) {
      this.logger.error(
        `Failed to confirm tickets for session ${event.payload.sessionId}`,
        error,
      );
      throw error;
    }
  }
}
