import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CheckoutSessionCompletedEvent } from '../../../tickets/domain/events/checkout-session-completed.event';
import { CheckoutSessionExpiredEvent } from '../../../tickets/domain/events/checkout-session-expired.event';
import { MessageEvent } from '../../../commons/domain/events/message.event';
// Estendi DomainEvent se necessario
type DomainEvent =
  | CheckoutSessionCompletedEvent
  | CheckoutSessionExpiredEvent
  | MessageEvent;
// type DomainEvent = { eventType: string; toJSON(): any };

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbitMQClient: ClientProxy,
  ) {}

  publish(event: DomainEvent, exchange?: string, routingKey?: string): void {
    this.logger.log(`Publishing event: ${event.eventType}`, event.toJSON());
    const pattern =
      exchange && routingKey ? `${exchange}:${routingKey}` : event.eventType;
    this.rabbitMQClient.emit(pattern, JSON.stringify(event));
    this.logger.debug(`Event published to RabbitMQ: ${pattern}`);
  }

  publishBatch(
    events: DomainEvent[],
    exchange?: string,
    routingKey?: string,
  ): void {
    for (const event of events) {
      this.publish(event, exchange, routingKey);
    }
  }
}
