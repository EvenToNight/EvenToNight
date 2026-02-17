import { EventEnvelope } from '@libs/ts-common/src/events/event-envelope';
export interface CheckoutSessionExpiredEventPayload {
  sessionId: string;
  orderId: string;
  expirationReason: string;
}

export class CheckoutSessionExpiredEvent implements EventEnvelope<CheckoutSessionExpiredEventPayload> {
  public readonly eventType = 'checkout.session.expired';
  public readonly occurredAt: Date;

  constructor(public readonly payload: CheckoutSessionExpiredEventPayload) {
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
