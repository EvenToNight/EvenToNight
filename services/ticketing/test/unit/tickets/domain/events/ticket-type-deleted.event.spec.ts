import { TicketTypeDeletedEvent } from 'src/tickets/domain/events/ticket-type-deleted.event';

describe('TicketTypeDeletedEvent', () => {
  const payload = { ticketTypeId: 'tt-1' };

  it('should set eventType to ticket-type.deleted', () => {
    const event = new TicketTypeDeletedEvent(payload);
    expect(event.eventType).toBe('ticket-type.deleted');
  });

  it('should store the payload', () => {
    const event = new TicketTypeDeletedEvent(payload);
    expect(event.payload).toEqual(payload);
  });

  it('should set occurredAt to a Date', () => {
    const event = new TicketTypeDeletedEvent(payload);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should serialize correctly with toJSON', () => {
    const event = new TicketTypeDeletedEvent(payload);
    const json = event.toJSON();
    expect(json).toEqual({
      eventType: 'ticket-type.deleted',
      occurredAt: event.occurredAt,
      payload,
    });
  });
});
