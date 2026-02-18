import { EventEnvelope } from '@libs/ts-common';
export interface OrderRejectedPayload {
  orderId: string;
  userId: string;
  eventId: string;
}

export class OrderRejectedEvent implements EventEnvelope<OrderRejectedPayload> {
  public readonly eventType = 'payments.order.rejected';
  public readonly occurredAt: Date;

  constructor(public readonly payload: OrderRejectedPayload) {
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
