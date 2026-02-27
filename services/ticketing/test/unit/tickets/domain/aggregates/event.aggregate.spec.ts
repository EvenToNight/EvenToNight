import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

describe('Event Aggregate', () => {
  const createEvent = (overrides?: Partial<{ date: Date; title: string }>) => {
    return Event.create({
      id: EventId.fromString('event-123'),
      creatorId: UserId.fromString('user-456'),
      status: EventStatus.PUBLISHED,
      date: overrides?.date,
      title: overrides?.title,
    });
  };

  describe('create', () => {
    it('should create an event with required params', () => {
      const event = createEvent();

      expect(event.getId().toString()).toBe('event-123');
      expect(event.getCreatorId().toString()).toBe('user-456');
      expect(event.getStatus()).toBe(EventStatus.PUBLISHED);
      expect(event.getDate()).toBeUndefined();
      expect(event.getTitle()).toBeUndefined();
    });

    it('should create an event with optional date and title', () => {
      const date = new Date('2025-06-15T20:00:00Z');
      const event = createEvent({ date, title: 'Summer Concert' });

      expect(event.getDate()).toBe(date);
      expect(event.getTitle()).toBe('Summer Concert');
    });
  });
});
