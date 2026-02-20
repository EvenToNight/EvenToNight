import { Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import type { EventEnvelope } from '@libs/ts-common';
import { Channel } from 'amqp-connection-manager';
import { Message } from 'amqplib';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { DeleteEventHandler } from 'src/tickets/application/handlers/delete-event.handler';
import { EventService } from 'src/tickets/application/services/event.service';

interface EventUpdatedPayload {
  eventId: string;
  date?: Date;
  name?: string;
  status: string;
}

interface EventPublishedPayload {
  eventId: string;
}

interface EventCompletedPayload {
  eventId: string;
}

interface EventCancelledPayload {
  eventId: string;
}

interface EventDeletedPayload {
  eventId: string;
}

@Injectable()
export class EventEventConsumer {
  private readonly logger = new Logger(EventEventConsumer.name);

  constructor(
    private readonly eventService: EventService,
    private readonly deleteHandler: DeleteEventHandler,
  ) {}

  async handleAllEvents(envelope: EventEnvelope<any>, context: RmqContext) {
    const message = context.getMessage() as Message;
    const routingKey = message.fields.routingKey;
    this.logger.log(`📨 Received event: ${routingKey}`);
    this.logger.debug(`Payload: ${JSON.stringify(envelope?.payload)}`);
    const channel = context.getChannelRef() as Channel;

    try {
      switch (routingKey) {
        case 'event.updated':
          await this.handleEventUpdated(
            envelope as EventEnvelope<EventUpdatedPayload>,
          );
          break;
        case 'event.published':
          await this.handleEventPublished(
            envelope as EventEnvelope<EventPublishedPayload>,
          );
          break;
        case 'event.completed':
          await this.handleEventCompleted(
            envelope as EventEnvelope<EventCompletedPayload>,
          );
          break;
        case 'event.cancelled':
          await this.handleEventCancelled(
            envelope as EventEnvelope<EventCancelledPayload>,
          );
          break;
        case 'event.deleted':
          await this.handleEventDeleted(
            envelope as EventEnvelope<EventDeletedPayload>,
          );
          break;
        default:
          this.logger.warn(`Unknown routing key: ${routingKey}`);
      }
      channel.ack(message);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to process ${routingKey}: ${error.message}`,
          error.stack,
        );
      }
      channel.nack(message, false, false);
    }
  }

  private async handleEventUpdated(
    envelope: EventEnvelope<EventUpdatedPayload>,
  ) {
    this.logger.log(
      `Processing event.updated: ${JSON.stringify(envelope.payload)}`,
    );
    await this.eventService.update({
      eventId: envelope.payload.eventId,
      date: envelope.payload.date,
      title: envelope.payload.name,
      status: envelope.payload.status,
    });
    this.logger.log(`Event updated: ${envelope.payload.eventId}`);
  }

  private async handleEventPublished(
    envelope: EventEnvelope<EventPublishedPayload>,
  ) {
    this.logger.log(`Processing event.published: ${envelope.payload.eventId}`);
    await this.eventService.updateStatus(
      envelope.payload.eventId,
      EventStatus.PUBLISHED,
    );
    this.logger.log(`Event published: ${envelope.payload.eventId}`);
  }

  private async handleEventCompleted(
    envelope: EventEnvelope<EventCompletedPayload>,
  ) {
    this.logger.log(`Processing event.completed: ${envelope.payload.eventId}`);
    await this.eventService.updateStatus(
      envelope.payload.eventId,
      EventStatus.COMPLETED,
    );
    this.logger.log(`Event completed: ${envelope.payload.eventId}`);
  }

  private async handleEventCancelled(
    envelope: EventEnvelope<EventCancelledPayload>,
  ) {
    this.logger.log(`Processing event.cancelled: ${envelope.payload.eventId}`);
    await this.eventService.updateStatus(
      envelope.payload.eventId,
      EventStatus.CANCELLED,
    );
    this.logger.log(`Event cancelled: ${envelope.payload.eventId}`);
  }

  private async handleEventDeleted(
    envelope: EventEnvelope<EventDeletedPayload>,
  ) {
    this.logger.log(`Processing event.deleted: ${envelope.payload.eventId}`);
    await this.deleteHandler.handle(envelope.payload.eventId);
    this.logger.log(`Event deleted: ${envelope.payload.eventId}`);
  }
}
