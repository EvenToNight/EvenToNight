import { Controller, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import type { EventEnvelope } from '../../../commons/domain/events/event-envelope';
import { Channel } from 'amqp-connection-manager';
import { Message } from 'amqplib';
import { UserEventConsumer } from './user-event.consumer';
import { EventEventConsumer } from './event-event.consumer';

@Controller()
export class EventDispatcher {
  private readonly logger = new Logger(EventDispatcher.name);

  constructor(
    private readonly userEventConsumer: UserEventConsumer,
    private readonly eventEventConsumer: EventEventConsumer,
  ) {}

  @MessagePattern()
  async handleAllEvents(
    @Payload() envelope: EventEnvelope<any>,
    @Ctx() context: RmqContext,
  ) {
    const message = context.getMessage() as Message;
    const routingKey = message.fields.routingKey;
    this.logger.log(`📨 Dispatching event: ${routingKey}`);
    const channel = context.getChannelRef() as Channel;

    try {
      if (routingKey.startsWith('user.')) {
        await this.userEventConsumer.handleAllEvents(envelope, context);
      } else if (routingKey.startsWith('event.')) {
        await this.eventEventConsumer.handleAllEvents(envelope, context);
      } else {
        this.logger.warn(`Unknown routing key pattern: ${routingKey}`);
        channel.ack(message);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to dispatch ${routingKey}: ${error.message}`,
          error.stack,
        );
      }
      channel.nack(message, false, false);
    }
  }
}
