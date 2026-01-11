import { TicketStatus } from '../../../../src/tickets/domain/value-objects/ticket-status.vo';

describe('TicketStatus', () => {
  describe('fromString', () => {
    it('should create ACTIVE status from string', () => {
      const status = TicketStatus.fromString('ACTIVE');

      expect(status).toBe(TicketStatus.ACTIVE);
      expect(status.toString()).toBe('ACTIVE');
    });

    it('should create CANCELLED status from string', () => {
      const status = TicketStatus.fromString('CANCELLED');

      expect(status).toBe(TicketStatus.CANCELLED);
      expect(status.toString()).toBe('CANCELLED');
    });

    it('should create REFUNDED status from string', () => {
      const status = TicketStatus.fromString('REFUNDED');

      expect(status).toBe(TicketStatus.REFUNDED);
      expect(status.toString()).toBe('REFUNDED');
    });

    it('should throw error for invalid status', () => {
      expect(() => TicketStatus.fromString('INVALID')).toThrow(
        'Invalid TicketStatus: INVALID',
      );
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance for same status', () => {
      const status1 = TicketStatus.fromString('ACTIVE');
      const status2 = TicketStatus.fromString('ACTIVE');

      expect(status1).toBe(status2);
    });
  });

  describe('equals', () => {
    it('should return true for same status', () => {
      const status1 = TicketStatus.ACTIVE;
      const status2 = TicketStatus.ACTIVE;

      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const status1 = TicketStatus.ACTIVE;
      const status2 = TicketStatus.CANCELLED;

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('convenience methods', () => {
    it('should check if status is active', () => {
      expect(TicketStatus.ACTIVE.isActive()).toBe(true);
      expect(TicketStatus.CANCELLED.isActive()).toBe(false);
    });

    it('should check if status is cancelled', () => {
      expect(TicketStatus.CANCELLED.isCancelled()).toBe(true);
      expect(TicketStatus.ACTIVE.isCancelled()).toBe(false);
    });

    it('should check if status is refunded', () => {
      expect(TicketStatus.REFUNDED.isRefunded()).toBe(true);
      expect(TicketStatus.ACTIVE.isRefunded()).toBe(false);
    });
  });
});
