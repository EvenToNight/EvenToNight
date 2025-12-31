import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoryService } from '../services/inventory.service';
import { RefundService } from '../../payments/services/refund.service';
import type {
  EventEnvelope,
  TicketsCreatedPayload,
  TicketsUpdatedPayload,
  EventCancelledPayload,
} from '../../common/events/event-envelope';

@Controller()
export class InventoryConsumer {
  private readonly logger = new Logger(InventoryConsumer.name);

  constructor(
    private inventoryService: InventoryService,
    private refundService: RefundService,
  ) {}

  /**
   * Handle event.tickets.created from Events service
   * Creates ticket categories for an event
   */
  @EventPattern('event.tickets.created')
  async handleTicketsCreated(
    @Payload() envelope: EventEnvelope<TicketsCreatedPayload>,
  ) {
    try {
      const { eventId, categories } = envelope.payload;

      this.logger.log(
        `Received event.tickets.created for event ${eventId} with ${categories.length} categories`,
      );

      // Create ticket categories
      const createdCategories =
        await this.inventoryService.createTicketCategories(
          eventId,
          categories.map((cat) => ({
            ...cat,
            saleStartDate: cat.saleStartDate || undefined,
            saleEndDate: cat.saleEndDate || undefined,
          })),
        );

      this.logger.log(
        `Created ${createdCategories.length} ticket categories for event ${eventId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle event.tickets.created: ${error.message}`,
        error.stack,
      );
      // Don't throw - allows message to be acknowledged and prevents infinite retries
    }
  }

  /**
   * Handle event.tickets.updated from Events service
   * Updates ticket categories for an event
   */
  @EventPattern('event.tickets.updated')
  async handleTicketsUpdated(
    @Payload() envelope: EventEnvelope<TicketsUpdatedPayload>,
  ) {
    try {
      const { eventId, categories } = envelope.payload;

      this.logger.log(
        `Received event.tickets.updated for event ${eventId}`,
      );

      // For now, log the update
      // TODO: Implement category update logic (careful not to break existing reservations)
      this.logger.warn(
        `Event ${eventId} tickets updated, manual review may be needed`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle event.tickets.updated: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle event.cancelled from Events service
   * Triggers automatic refunds for all tickets
   */
  @EventPattern('event.cancelled')
  async handleEventCancelled(
    @Payload() envelope: EventEnvelope<EventCancelledPayload>,
  ) {
    try {
      const { eventId, reason } = envelope.payload;

      this.logger.log(
        `Received event.cancelled for event ${eventId}: ${reason}`,
      );

      // Process automatic refunds
      await this.refundService.processEventCancellationRefunds(eventId, reason);

      this.logger.log(
        `Automatic refunds processed for cancelled event ${eventId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle event.cancelled for ${envelope.payload.eventId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
