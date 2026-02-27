import { EventNotPublishedException } from 'src/tickets/domain/exceptions/event-not-published.exception';

describe('EventNotPublishedException', () => {
  it('includes the event ID in the message', () => {
    const err = new EventNotPublishedException('event-123');
    expect(err.message).toContain('event-123');
    expect(err.name).toBe('EventNotPublishedException');
    expect(err).toBeInstanceOf(Error);
  });
});
