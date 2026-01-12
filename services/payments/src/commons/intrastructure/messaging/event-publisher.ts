import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { CheckoutSessionCompletedEvent } from '../../../tickets/domain/events/checkout-session-completed.event';
import { CheckoutSessionExpiredEvent } from '../../../tickets/domain/events/checkout-session-expired.event';

type DomainEvent = CheckoutSessionCompletedEvent | CheckoutSessionExpiredEvent;

/**
 * EventPublisher - Bridge between Domain Events and Infrastructure
 *
 * This service acts as a bridge that:
 * 1. Publishes events locally using @nestjs/cqrs EventBus (for in-process handlers)
 * 2. Publishes events to RabbitMQ (for inter-service communication)
 *
 * This hybrid approach allows:
 * - Local event handlers with @EventsHandler decorator
 * - Remote event consumers in other microservices via RabbitMQ
 */
@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject('RABBITMQ_CLIENT') private readonly rabbitMQClient: ClientProxy,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async publish(event: DomainEvent): Promise<void> {
    // 1. Publish locally to in-process handlers (@EventsHandler)
    this.eventBus.publish(event);

    // 2. Log for observability
    this.logger.log(`Publishing event: ${event.eventType}`, event.toJSON());

    // 3. Publish to RabbitMQ for other microservices
    try {
      this.rabbitMQClient.emit(event.eventType, JSON.stringify(event));
      this.logger.debug(`Event published to RabbitMQ: ${event.eventType}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish event to RabbitMQ: ${event.eventType}`,
        error,
      );
      // Don't throw - local handlers should still work
    }
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
