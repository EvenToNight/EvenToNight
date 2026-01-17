import { EventEnvelope } from '../../../commons/domain/events/event-envelope';

export interface CheckoutSessionCompletedEventPayload {
  sessionId: string;
  orderId: string;
}

export class CheckoutSessionCompletedEvent implements EventEnvelope<CheckoutSessionCompletedEventPayload> {
  public readonly eventType = 'checkout.session.completed';
  public readonly occurredAt: Date;

  constructor(public readonly payload: CheckoutSessionCompletedEventPayload) {
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
