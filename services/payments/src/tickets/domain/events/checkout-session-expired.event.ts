import { EventEnvelope } from '../../../commons/domain/events/event-envelope';
export interface CheckoutSessionExpiredEventPayload {
  sessionId: string;
  ticketIds: string[];
  userId: string;
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
