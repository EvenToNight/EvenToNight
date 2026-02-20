import { EventNotFoundException } from 'src/tickets/domain/exceptions/event-not-found.exception';

describe('EventNotFoundException', () => {
  it('includes the event ID in the message when provided', () => {
    const err = new EventNotFoundException('ev-123');
    expect(err.message).toBe('Event with id ev-123 not found');
    expect(err.name).toBe('EventNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('uses a generic message when no ID is provided', () => {
    const err = new EventNotFoundException();
    expect(err.message).toBe('Event not found');
  });
});
