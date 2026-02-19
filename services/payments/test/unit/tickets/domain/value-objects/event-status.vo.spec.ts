import { InvalidEventStatusException } from 'src/tickets/domain/exceptions/invalid-event-status.exception';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

describe('EventStatus', () => {
  describe('fromString', () => {
    it('should create DRAFT status from string', () => {
      const status = EventStatus.fromString('DRAFT');
      expect(status).toBe(EventStatus.DRAFT);

      const statusRandom = EventStatus.fromString('drAfT');
      expect(statusRandom).toBe(EventStatus.DRAFT);
    });

    it('should create PUBLISHED status from string', () => {
      const status = EventStatus.fromString('PUBLISHED');
      expect(status).toBe(EventStatus.PUBLISHED);

      const statusRandom = EventStatus.fromString('PuBLiSHeD');
      expect(statusRandom).toBe(EventStatus.PUBLISHED);
    });

    it('should create CANCELLED status from string', () => {
      const status = EventStatus.fromString('CANCELLED');
      expect(status).toBe(EventStatus.CANCELLED);

      const statusRandom = EventStatus.fromString('cAnCeLLeD');
      expect(statusRandom).toBe(EventStatus.CANCELLED);
    });

    it('should create COMPLETED status from string', () => {
      const status = EventStatus.fromString('COMPLETED');
      expect(status).toBe(EventStatus.COMPLETED);

      const statusRandom = EventStatus.fromString('cOmPlEtEd');
      expect(statusRandom).toBe(EventStatus.COMPLETED);
    });

    it('should throw error for invalid status', () => {
      expect(() => EventStatus.fromString('INVALID')).toThrow(
        InvalidEventStatusException,
      );
    });
  });

  describe('equals', () => {
    it('should return true for same status', () => {
      const status1 = EventStatus.DRAFT;
      const status2 = EventStatus.DRAFT;

      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const status1 = EventStatus.DRAFT;
      const status2 = EventStatus.PUBLISHED;

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('convenience methods', () => {
    it('should check if status is DRAFT', () => {
      expect(EventStatus.DRAFT.isDraft()).toBe(true);
      expect(EventStatus.PUBLISHED.isDraft()).toBe(false);
    });

    it('should check if status is PUBLISHED', () => {
      expect(EventStatus.PUBLISHED.isPublished()).toBe(true);
      expect(EventStatus.DRAFT.isPublished()).toBe(false);
    });

    it('should check if status is COMPLETED', () => {
      expect(EventStatus.COMPLETED.isCompleted()).toBe(true);
      expect(EventStatus.DRAFT.isCompleted()).toBe(false);
    });

    it('should check if status is CANCELLED', () => {
      expect(EventStatus.CANCELLED.isCancelled()).toBe(true);
      expect(EventStatus.DRAFT.isCancelled()).toBe(false);
    });
  });

  describe('getAllStatuses', () => {
    it('should return all statuses', () => {
      const statuses = EventStatus.getAllStatuses();

      expect(statuses).toHaveLength(4);
      expect(statuses).toEqual(
        expect.arrayContaining([
          EventStatus.DRAFT,
          EventStatus.PUBLISHED,
          EventStatus.COMPLETED,
          EventStatus.CANCELLED,
        ]),
      );
    });
  });

  describe('getAllValues', () => {
    it('should return all status values', () => {
      const values = EventStatus.getAllValues();

      expect(values).toHaveLength(4);
      expect(values).toEqual(
        expect.arrayContaining([
          'DRAFT',
          'PUBLISHED',
          'COMPLETED',
          'CANCELLED',
        ]),
      );
    });
  });
});
