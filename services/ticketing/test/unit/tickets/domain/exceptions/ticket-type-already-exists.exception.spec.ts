import { TicketTypeAlreadyExistsException } from 'src/tickets/domain/exceptions/ticket-type-already-exists.exception';

describe('TicketTypeAlreadyExistsException', () => {
  it('includes the type and event ID in the message', () => {
    const err = new TicketTypeAlreadyExistsException('VIP', 'event-123');
    expect(err.message).toBe(
      "Ticket type 'VIP' already exists for event 'event-123'",
    );
    expect(err.name).toBe('TicketTypeAlreadyExistsException');
    expect(err).toBeInstanceOf(Error);
  });
});
