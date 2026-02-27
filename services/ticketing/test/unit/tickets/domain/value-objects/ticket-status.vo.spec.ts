import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { InvalidTicketStatusValueException } from 'src/tickets/domain/exceptions/invalid-ticket-status-value.exception';

describe('TicketStatus', () => {
  describe('fromString', () => {
    it('should create ACTIVE status from string', () => {
      const status = TicketStatus.fromString('ACTIVE');

      expect(status).toBe(TicketStatus.ACTIVE);
      expect(status.toString()).toBe('ACTIVE');

      const statusRandom = TicketStatus.fromString('aCtIvE');
      expect(statusRandom).toBe(TicketStatus.ACTIVE);
    });

    it('should create CANCELLED status from string', () => {
      const status = TicketStatus.fromString('CANCELLED');

      expect(status).toBe(TicketStatus.CANCELLED);
      expect(status.toString()).toBe('CANCELLED');

      const statusRandom = TicketStatus.fromString('cAnCeLLeD');
      expect(statusRandom).toBe(TicketStatus.CANCELLED);
    });

    it('should create REFUNDED status from string', () => {
      const status = TicketStatus.fromString('REFUNDED');

      expect(status).toBe(TicketStatus.REFUNDED);
      expect(status.toString()).toBe('REFUNDED');

      const statusRandom = TicketStatus.fromString('rEfUnDeD');
      expect(statusRandom).toBe(TicketStatus.REFUNDED);
    });

    it('should create PENDING_PAYMENT status from string', () => {
      const status = TicketStatus.fromString('PENDING_PAYMENT');

      expect(status).toBe(TicketStatus.PENDING_PAYMENT);
      expect(status.toString()).toBe('PENDING_PAYMENT');

      const statusRandom = TicketStatus.fromString('pEnDiNg_pAyMeNt');
      expect(statusRandom).toBe(TicketStatus.PENDING_PAYMENT);
    });

    it('should create PAYMENT_FAILED status from string', () => {
      const status = TicketStatus.fromString('PAYMENT_FAILED');

      expect(status).toBe(TicketStatus.PAYMENT_FAILED);
      expect(status.toString()).toBe('PAYMENT_FAILED');

      const statusRandom = TicketStatus.fromString('pAyMeNt_fAiLeD');
      expect(statusRandom).toBe(TicketStatus.PAYMENT_FAILED);
    });

    it('should create USED status from string', () => {
      const status = TicketStatus.fromString('USED');

      expect(status).toBe(TicketStatus.USED);
      expect(status.toString()).toBe('USED');

      const statusRandom = TicketStatus.fromString('uSeD');
      expect(statusRandom).toBe(TicketStatus.USED);
    });

    it('should throw error for invalid status', () => {
      expect(() => TicketStatus.fromString('INVALID')).toThrow(
        InvalidTicketStatusValueException,
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

    it('should check if status is pending payment', () => {
      expect(TicketStatus.PENDING_PAYMENT.isPendingPayment()).toBe(true);
      expect(TicketStatus.ACTIVE.isPendingPayment()).toBe(false);
    });

    it('should check if status is payment failed', () => {
      expect(TicketStatus.PAYMENT_FAILED.isPaymentFailed()).toBe(true);
      expect(TicketStatus.ACTIVE.isPaymentFailed()).toBe(false);
    });

    it('should check if status is used', () => {
      expect(TicketStatus.USED.isUsed()).toBe(true);
      expect(TicketStatus.ACTIVE.isUsed()).toBe(false);
    });
  });

  describe('getAllStatuses', () => {
    it('should return all statuses', () => {
      const statuses = TicketStatus.getAllStatuses();

      expect(statuses).toContain(TicketStatus.ACTIVE);
      expect(statuses).toContain(TicketStatus.CANCELLED);
      expect(statuses).toContain(TicketStatus.REFUNDED);
      expect(statuses).toContain(TicketStatus.PENDING_PAYMENT);
      expect(statuses).toContain(TicketStatus.PAYMENT_FAILED);
    });
  });

  describe('getAllValues', () => {
    it('should return all status values', () => {
      const values = TicketStatus.getAllValues();

      expect(values).toContain('PENDING_PAYMENT');
      expect(values).toContain('ACTIVE');
      expect(values).toContain('CANCELLED');
      expect(values).toContain('REFUNDED');
      expect(values).toContain('PAYMENT_FAILED');
    });
  });
});
