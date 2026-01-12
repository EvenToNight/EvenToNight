import { EventEnvelope } from '../../../commons/domain/events/event-envelope';

export interface BaseCheckoutSessionCompletedEventPayload {
  sessionId: string;
  ticketIds: string[];
}

export class BaseCheckoutSessionCompletedEvent implements EventEnvelope<BaseCheckoutSessionCompletedEventPayload> {
  public readonly eventType = 'base.checkout.session.completed';
  public readonly occurredAt: Date;

  constructor(
    public readonly payload: BaseCheckoutSessionCompletedEventPayload,
  ) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      occurredAt: this.occurredAt,
      payload: this.payload,
    };
  }
}
