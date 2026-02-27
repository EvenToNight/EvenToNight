import { EventEnvelope } from '@libs/ts-common';
export interface TicketTypeCreatedPayload {
  eventId: string;
  ticketTypeId: string;
  price: number;
}

export class TicketTypeCreatedEvent implements EventEnvelope<TicketTypeCreatedPayload> {
  public readonly eventType = 'ticket-type.created';
  public readonly occurredAt: Date;

  constructor(public readonly payload: TicketTypeCreatedPayload) {
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
