import { TicketsNotFoundException } from 'src/tickets/domain/exceptions/tickets-not-found.exception';

describe('TicketsNotFoundException', () => {
  it('uses the provided message', () => {
    const err = new TicketsNotFoundException('No tickets for this event');
    expect(err.message).toBe('No tickets for this event');
    expect(err.name).toBe('TicketsNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('uses a generic message when none is provided', () => {
    const err = new TicketsNotFoundException();
    expect(err.message).toBe('No tickets found');
  });
});
