import { Logger } from '@nestjs/common';
import { TransactionManager } from '../../infrastructure/database/transaction.manager';
import { TicketService } from '../services/ticket.service';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { OrderService } from '../services/order.service';

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
export class CheckoutSessionExpiredHandler {
  private readonly logger = new Logger(CheckoutSessionExpiredHandler.name);

  constructor(
    private readonly ticketService: TicketService,
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly orderService: OrderService,
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(
    sessionId: string,
    orderId: string,
    reason?: string,
  ): Promise<void> {
    this.logger.log(`Handling checkout session expired: ${sessionId}`);
    const order = await this.orderService.findById(orderId);
    //TODO: publish some events? reason is needed?
    if (reason) {
      this.logger.log(`Reason for expiration: ${reason}`);
    }
    //TODO handle order not found and update order status
    if (!order) {
      this.logger.warn(`Order ${orderId} not found`);
      throw new Error(`Order ${orderId} not found`);
    }
    const ticketIds = order.getTicketIds();

    try {
      await this.cancelTicketPayment(ticketIds);
      order.cancel();
      await this.orderService.update(order);
      this.logger.log(
        `Successfully handled expired session ${sessionId}: ` +
          `${ticketIds.length} tickets marked as PAYMENT_FAILED and inventory released`,
      );
    } catch (error) {
      this.logger.error(`Failed to handle expired session ${sessionId}`, error);
      throw error;
    }
  }

  private async cancelTicketPayment(ticketIds: string[]): Promise<void> {
    return this.transactionManager.executeInTransaction(async () => {
      const ticketTypeMap = new Map<string, number>();
      for (const ticketId of ticketIds) {
        const ticket = await this.ticketService.findById(ticketId);
        if (ticket && ticket.isPendingPayment()) {
          ticket.markPaymentFailed();
          await this.ticketService.update(ticket);
          const typeId = ticket.getTicketTypeId();
          ticketTypeMap.set(typeId, (ticketTypeMap.get(typeId) || 0) + 1);
        }
      }

      for (const [ticketTypeId, count] of ticketTypeMap.entries()) {
        const ticketType =
          await this.eventTicketTypeService.findById(ticketTypeId);
        if (ticketType) {
          for (let i = 0; i < count; i++) {
            ticketType.releaseTicket();
          }
          await this.eventTicketTypeService.update(ticketType);
        }
      }
    });
  }
}
