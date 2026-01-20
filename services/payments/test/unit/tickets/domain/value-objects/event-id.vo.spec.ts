import { EventId } from '../../../../../src/tickets/domain/value-objects/event-id.vo';

describe('EventId', () => {
  describe('fromString', () => {
    it('should create EventId from valid string', () => {
      const result = EventId.fromString('event-123');
      expect(result).toBeInstanceOf(EventId);
      expect(result.getValue()).toBe('event-123');
    });

    it('should throw error for empty string', () => {
      expect(() => EventId.fromString('')).toThrow('EventId cannot be empty');
    });

    it('should throw error for string with only spaces', () => {
      expect(() => EventId.fromString('   ')).toThrow(
        'EventId cannot be empty',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const id1 = EventId.fromString('event-123');
      const id2 = EventId.fromString('event-123');
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = EventId.fromString('event-123');
      const id2 = EventId.fromString('event-456');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const id = EventId.fromString('event-123');
      expect(id.toString()).toBe('event-123');
    });
  });

  describe('getValue', () => {
    it('should return the internal value', () => {
      const id = EventId.fromString('event-123');
      expect(id.getValue()).toBe('event-123');
    });
  });
});
