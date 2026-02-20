import { randomUUID } from 'crypto';
import type { OutboxRepository } from './outbox.repository.interface';
import type { OutboxServiceInterface } from './outbox.service.interface';
import type { EventEnvelope } from '../events/event-envelope';

export class OutboxServiceBase implements OutboxServiceInterface {
  constructor(protected readonly outboxRepository: OutboxRepository) {}

  async addEvent(
    event: EventEnvelope<unknown>,
    routingKey: string,
  ): Promise<void> {
    await this.outboxRepository.save({
      id: randomUUID(),
      eventType: routingKey,
      payload: JSON.stringify(event),
      occurredAt: event.occurredAt,
      processedAt: null,
    });
  }
}
