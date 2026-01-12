import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CheckoutSessionExpiredEvent } from '../../domain/events/checkout-session-expired.event';
import type { TicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { TICKET_REPOSITORY } from '../../domain/repositories/ticket.repository.interface';
import type { EventTicketTypeRepository } from '../../domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from '../../domain/repositories/event-ticket-type.repository.interface';
import { TransactionManager } from '../../infrastructure/database/transaction.manager';

/**
 * Handler for Checkout Session Expired Event (Saga Compensation)
 *
 * This handler is triggered when a user doesn't complete payment within
 * the checkout session timeout (typically 30 minutes). It performs
 * compensating actions to release reserved inventory.
 *
 * Flow:
 * 1. Receive CheckoutSessionExpiredEvent from webhook controller
 * 2. Mark all tickets as PAYMENT_FAILED (TX2)
 * 3. Release inventory for all ticket types
 */
@EventsHandler(CheckoutSessionExpiredEvent)
export class CheckoutSessionExpiredHandler implements IEventHandler<CheckoutSessionExpiredEvent> {
  private readonly logger = new Logger(CheckoutSessionExpiredHandler.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly ticketTypeRepository: EventTicketTypeRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(event: CheckoutSessionExpiredEvent): Promise<void> {
    this.logger.log(
      `Handling checkout session expired: ${event.payload.sessionId}`,
    );

    const { ticketIds } = event.payload;

    try {
      await this.transactionManager.executeInTransaction(async () => {
        const ticketTypeMap = new Map<string, number>();
        for (const ticketId of ticketIds) {
          const ticket = await this.ticketRepository.findById(ticketId);
          if (ticket && ticket.isPendingPayment()) {
            ticket.markPaymentFailed();
            await this.ticketRepository.update(ticket);
            const typeId = ticket.getTicketTypeId();
            ticketTypeMap.set(typeId, (ticketTypeMap.get(typeId) || 0) + 1);
          }
        }

        for (const [ticketTypeId, count] of ticketTypeMap.entries()) {
          const ticketType =
            await this.ticketTypeRepository.findById(ticketTypeId);
          if (ticketType) {
            for (let i = 0; i < count; i++) {
              ticketType.releaseTicket();
            }
            await this.ticketTypeRepository.update(ticketType);
          }
        }
      });

      this.logger.log(
        `Successfully handled expired session ${event.payload.sessionId}: ` +
          `${ticketIds.length} tickets marked as PAYMENT_FAILED and inventory released`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle expired session ${event.payload.sessionId}`,
        error,
      );
      throw error;
    }
  }
}
