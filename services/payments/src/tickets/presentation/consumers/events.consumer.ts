import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { EventEnvelope } from '../../../commons/domain/events/event-envelope';
import { title } from 'process';

//TODO: Define payload interfaces for each event, interfaces can contain only relevant fields of the real message?
interface EventPublishedPayload {
  eventId: string;
  organizerId: string;
}

interface UserPayload {
  id: string;
  language: string;
}

/**
 * Events Consumer - Handles events from other microservices via RabbitMQ
 *
 * This consumer listens to events published by other services (e.g., Events service)
 * and reacts accordingly. Uses @EventPattern decorator to bind to RabbitMQ routing keys.
 */
@Controller()
export class EventsConsumer {
  private readonly logger = new Logger(EventsConsumer.name);

  @EventPattern('event.published')
  // eslint-disable-next-line @typescript-eslint/require-await
  async handleEventPublished(
    @Payload() envelope: EventEnvelope<EventPublishedPayload>,
  ) {
    this.logger.log(
      `Received event.published: ${JSON.stringify(envelope.payload)}`,
    );

    const { eventId } = envelope.payload;
    this.logger.log(`New event created: ${title} (${eventId})`);
  }

  @EventPattern('user.created')
  @EventPattern('user.updated')
  // eslint-disable-next-line @typescript-eslint/require-await
  async handleUserCreatedOrUpdated(
    @Payload() envelope: EventEnvelope<UserPayload>,
  ) {
    this.logger.log(
      `Received ${envelope.eventType}: ${JSON.stringify(envelope.payload)}`,
    );
  }

  @EventPattern('user.deleted')
  // eslint-disable-next-line @typescript-eslint/require-await
  async handleUserDeleted(@Payload() envelope: EventEnvelope<UserPayload>) {
    this.logger.log(
      `Received user.deleted: ${JSON.stringify(envelope.payload)}`,
    );
  }
}
