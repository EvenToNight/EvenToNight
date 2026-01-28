import { Inject, Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import type { EventEnvelope } from '../../../commons/domain/events/event-envelope';
import { Channel } from 'amqp-connection-manager';
import { Message } from 'amqplib';
import {
  EVENT_REPOSITORY,
  type EventRepository,
} from 'src/tickets/domain/repositories/event.repository.interface';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { DeleteEventTicketTypesHandler } from 'src/tickets/application/handlers/delete-event-ticket-types.handler';

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
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    private readonly deleteHandler: DeleteEventTicketTypesHandler,
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

    await this.eventRepository.update({
      eventId: EventId.fromString(envelope.payload.eventId),
      date: envelope.payload.date,
      title: envelope.payload.name,
      status: EventStatus.fromString(envelope.payload.status),
    });

    this.logger.log(`Event updated: ${envelope.payload.eventId}`);
  }

  private async handleEventPublished(
    envelope: EventEnvelope<EventPublishedPayload>,
  ) {
    this.logger.log(`Processing event.published: ${envelope.payload.eventId}`);
    await this.eventRepository.updateStatus(
      EventId.fromString(envelope.payload.eventId),
      EventStatus.PUBLISHED,
    );
    this.logger.log(`Event published: ${envelope.payload.eventId}`);
  }

  private async handleEventCompleted(
    envelope: EventEnvelope<EventCompletedPayload>,
  ) {
    this.logger.log(`Processing event.completed: ${envelope.payload.eventId}`);
    await this.eventRepository.updateStatus(
      EventId.fromString(envelope.payload.eventId),
      EventStatus.COMPLETED,
    );
    this.logger.log(`Event completed: ${envelope.payload.eventId}`);
  }

  private async handleEventCancelled(
    envelope: EventEnvelope<EventCancelledPayload>,
  ) {
    this.logger.log(`Processing event.cancelled: ${envelope.payload.eventId}`);
    await this.eventRepository.updateStatus(
      EventId.fromString(envelope.payload.eventId),
      EventStatus.CANCELLED,
    );
    this.logger.log(`Event deleted: ${envelope.payload.eventId}`);
  }

  private async handleEventDeleted(
    envelope: EventEnvelope<EventDeletedPayload>,
  ) {
    this.logger.log(`Processing event.deleted: ${envelope.payload.eventId}`);
    await this.deleteHandler.handle(envelope.payload.eventId);
    await this.eventRepository.delete(envelope.payload.eventId);
    this.logger.log(`Event deleted: ${envelope.payload.eventId}`);
  }
}
