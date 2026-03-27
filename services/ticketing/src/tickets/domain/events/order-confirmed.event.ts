import { EventEnvelope } from '@libs/ts-common';
export interface OrderConfirmedPayload {
  orderId: string;
  userId: string;
  eventId: string;
}

export class OrderConfirmedEvent implements EventEnvelope<OrderConfirmedPayload> {
  public readonly eventType = 'payments.order.confirmed';
  public readonly occurredAt: Date;

  constructor(public readonly payload: OrderConfirmedPayload) {
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
