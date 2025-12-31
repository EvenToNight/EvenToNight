import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type {
  EventEnvelope,
  TicketPurchasedPayload,
  TicketRefundedPayload,
  TicketUsedPayload,
} from '../../common/events/event-envelope';
import { Order } from '../../payments/schemas/order.schema';
import { Ticket } from '../schemas/ticket.schema';

@Injectable()
export class TicketPublisher {
  private readonly logger = new Logger(TicketPublisher.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private rabbitClient: ClientProxy,
  ) {}

  /**
   * Publish ticket.purchased event
   */
  async publishTicketPurchased(order: Order, tickets: Ticket[]): Promise<void> {
    try {
      const envelope: EventEnvelope<TicketPurchasedPayload> = {
        eventType: 'ticket.purchased',
        occurredAt: new Date().toISOString(),
        payload: {
          orderId: order.orderNumber,
          userId: order.userId,
          eventId: order.eventId,
          tickets: tickets.map((t) => ({
            ticketId: t._id.toString(),
            categoryName: t.categoryName,
            ticketNumber: t.ticketNumber,
          })),
          totalAmount: order.totalAmount,
        },
      };

      this.rabbitClient.emit('ticket.purchased', envelope);

      this.logger.log(
        `Published ticket.purchased event for order ${order.orderNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish ticket.purchased: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Publish ticket.refunded event
   */
  async publishTicketRefunded(
    order: Order,
    ticketIds: string[],
    refundAmount: number,
  ): Promise<void> {
    try {
      const envelope: EventEnvelope<TicketRefundedPayload> = {
        eventType: 'ticket.refunded',
        occurredAt: new Date().toISOString(),
        payload: {
          orderId: order.orderNumber,
          userId: order.userId,
          eventId: order.eventId,
          ticketIds,
          refundAmount,
        },
      };

      this.rabbitClient.emit('ticket.refunded', envelope);

      this.logger.log(
        `Published ticket.refunded event for order ${order.orderNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish ticket.refunded: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Publish ticket.used event
   */
  async publishTicketUsed(ticket: Ticket): Promise<void> {
    try {
      const envelope: EventEnvelope<TicketUsedPayload> = {
        eventType: 'ticket.used',
        occurredAt: new Date().toISOString(),
        payload: {
          ticketId: ticket._id.toString(),
          ticketNumber: ticket.ticketNumber,
          eventId: ticket.eventId,
          userId: ticket.userId,
          usedAt: ticket.usedAt!.toISOString(),
        },
      };

      this.rabbitClient.emit('ticket.used', envelope);

      this.logger.log(
        `Published ticket.used event for ticket ${ticket.ticketNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish ticket.used: ${error.message}`,
        error.stack,
      );
    }
  }
}
