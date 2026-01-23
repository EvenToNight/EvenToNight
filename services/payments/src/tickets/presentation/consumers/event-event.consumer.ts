import { Controller, Inject, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import type { EventEnvelope } from '../../../commons/domain/events/event-envelope';
import { Channel } from 'amqp-connection-manager';
import { Message } from 'amqplib';
import {
  EVENT_REPOSITORY,
  type EventRepository,
} from 'src/tickets/domain/repositories/event.repository.interface';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

interface EventUpdatedPayload {
  eventId: string;
  date: Date;
  status: string;
}

interface EventDeletedPayload {
  eventId: string;
}

@Controller()
export class EventEventConsumer {
  private readonly logger = new Logger(EventEventConsumer.name);

  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  @MessagePattern()
  async handleAllEvents(
    @Payload() envelope: EventEnvelope<any>,
    @Ctx() context: RmqContext,
  ) {
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
      status: EventStatus.fromString(envelope.payload.status),
    });

    this.logger.log(`Event updated: ${envelope.payload.eventId}`);
  }

  private async handleEventDeleted(
    envelope: EventEnvelope<EventDeletedPayload>,
  ) {
    this.logger.log(`Processing event.deleted: ${envelope.payload.eventId}`);
    await this.eventRepository.delete(envelope.payload.eventId);
    this.logger.log(`Event deleted: ${envelope.payload.eventId}`);
  }
}
