import { TicketTypeUpdatedEvent } from 'src/tickets/domain/events/ticket-type-updated.event';

describe('TicketTypeUpdatedEvent', () => {
  const payload = { ticketTypeId: 'tt-1', price: 7500 };

  it('should set eventType to ticket-type.updated', () => {
    const event = new TicketTypeUpdatedEvent(payload);
    expect(event.eventType).toBe('ticket-type.updated');
  });

  it('should store the payload', () => {
    const event = new TicketTypeUpdatedEvent(payload);
    expect(event.payload).toEqual(payload);
  });

  it('should set occurredAt to a Date', () => {
    const event = new TicketTypeUpdatedEvent(payload);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should serialize correctly with toJSON', () => {
    const event = new TicketTypeUpdatedEvent(payload);
    const json = event.toJSON();
    expect(json).toEqual({
      eventType: 'ticket-type.updated',
      occurredAt: event.occurredAt,
      payload,
    });
  });
});
