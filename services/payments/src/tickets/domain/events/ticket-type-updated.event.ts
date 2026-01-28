import { EventEnvelope } from '../../../commons/domain/events/event-envelope';
export interface TicketTypeUpdatedPayload {
  ticketTypeId: string;
  price: number;
}

export class TicketTypeUpdatedEvent implements EventEnvelope<TicketTypeUpdatedPayload> {
  public readonly eventType = 'ticket-type.updated';
  public readonly occurredAt: Date;

  constructor(public readonly payload: TicketTypeUpdatedPayload) {
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
