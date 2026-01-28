import { EventEnvelope } from '../../../commons/domain/events/event-envelope';
export interface TicketTypeDeletedPayload {
  ticketTypeId: string;
}

export class TicketTypeDeletedEvent implements EventEnvelope<TicketTypeDeletedPayload> {
  public readonly eventType = 'ticket-type.deleted';
  public readonly occurredAt: Date;

  constructor(public readonly payload: TicketTypeDeletedPayload) {
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
