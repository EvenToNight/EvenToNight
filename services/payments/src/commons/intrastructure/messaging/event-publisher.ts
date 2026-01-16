import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CheckoutSessionCompletedEvent } from '../../../tickets/domain/events/checkout-session-completed.event';
import { CheckoutSessionExpiredEvent } from '../../../tickets/domain/events/checkout-session-expired.event';

type DomainEvent = CheckoutSessionCompletedEvent | CheckoutSessionExpiredEvent;

/**
 * EventPublisher - Bridge between Domain Events and Infrastructure
 *
 * Publishes events to RabbitMQ (for inter-service communication)
 *
 */
@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbitMQClient: ClientProxy,
  ) {}

  publish(event: DomainEvent): void {
    // 2. Log for observability
    this.logger.log(`Publishing event: ${event.eventType}`, event.toJSON());
    this.rabbitMQClient.emit(event.eventType, JSON.stringify(event));
    this.logger.debug(`Event published to RabbitMQ: ${event.eventType}`);
  }

  publishBatch(events: DomainEvent[]): void {
    for (const event of events) {
      this.publish(event);
    }
  }
}
