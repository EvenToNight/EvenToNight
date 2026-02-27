import { TicketNotFoundException } from 'src/tickets/domain/exceptions/ticket-not-found-exception';

describe('TicketNotFoundException', () => {
  it('includes the ticket ID in the message when provided', () => {
    const err = new TicketNotFoundException('ticket-42');
    expect(err.message).toBe('Ticket with id ticket-42 not found');
    expect(err.name).toBe('TicketNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('uses a generic message when no ID is provided', () => {
    const err = new TicketNotFoundException();
    expect(err.message).toBe('Ticket not found');
  });
});
