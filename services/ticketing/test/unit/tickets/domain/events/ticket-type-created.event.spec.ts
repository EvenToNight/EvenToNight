import { TicketTypeCreatedEvent } from 'src/tickets/domain/events/ticket-type-created.event';

describe('TicketTypeCreatedEvent', () => {
  const payload = {
    eventId: 'event-1',
    ticketTypeId: 'tt-1',
    price: 5000,
  };

  it('should set eventType to ticket-type.created', () => {
    const event = new TicketTypeCreatedEvent(payload);
    expect(event.eventType).toBe('ticket-type.created');
  });

  it('should store the payload', () => {
    const event = new TicketTypeCreatedEvent(payload);
    expect(event.payload).toEqual(payload);
  });

  it('should set occurredAt to a Date', () => {
    const event = new TicketTypeCreatedEvent(payload);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should serialize correctly with toJSON', () => {
    const event = new TicketTypeCreatedEvent(payload);
    const json = event.toJSON();
    expect(json).toEqual({
      eventType: 'ticket-type.created',
      occurredAt: event.occurredAt,
      payload,
    });
  });
});
