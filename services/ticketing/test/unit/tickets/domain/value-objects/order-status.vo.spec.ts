import { OrderStatus } from 'src/tickets/domain/value-objects/order-status.vo';
import { InvalidOrderStatusException } from 'src/tickets/domain/exceptions/invalid-order-status.exception';

describe('OrderStatus', () => {
  describe('fromString', () => {
    it('should create PENDING status from string', () => {
      const status = OrderStatus.fromString('PENDING');
      expect(status).toBe(OrderStatus.PENDING);

      const statusRandom = OrderStatus.fromString('pEnDiNg');
      expect(statusRandom).toBe(OrderStatus.PENDING);
    });

    it('should create COMPLETED status from string', () => {
      const status = OrderStatus.fromString('COMPLETED');
      expect(status).toBe(OrderStatus.COMPLETED);

      const statusRandom = OrderStatus.fromString('cOmPlEtEd');
      expect(statusRandom).toBe(OrderStatus.COMPLETED);
    });

    it('should create CANCELLED status from string', () => {
      const status = OrderStatus.fromString('CANCELLED');
      expect(status).toBe(OrderStatus.CANCELLED);

      const statusRandom = OrderStatus.fromString('cAnCeLLeD');
      expect(statusRandom).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error for invalid status', () => {
      expect(() => OrderStatus.fromString('INVALID')).toThrow(
        InvalidOrderStatusException,
      );
    });
  });

  describe('equals', () => {
    it('should return true for same status', () => {
      const status1 = OrderStatus.PENDING;
      const status2 = OrderStatus.PENDING;

      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const status1 = OrderStatus.PENDING;
      const status2 = OrderStatus.COMPLETED;

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('convenience methods', () => {
    it('should check if status is PENDING', () => {
      expect(OrderStatus.PENDING.isPending()).toBe(true);
      expect(OrderStatus.COMPLETED.isPending()).toBe(false);
    });

    it('should check if status is COMPLETED', () => {
      expect(OrderStatus.COMPLETED.isCompleted()).toBe(true);
      expect(OrderStatus.PENDING.isCompleted()).toBe(false);
    });

    it('should check if status is CANCELLED', () => {
      expect(OrderStatus.CANCELLED.isCancelled()).toBe(true);
      expect(OrderStatus.PENDING.isCancelled()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      expect(OrderStatus.PENDING.toString()).toBe('PENDING');
    });
  });

  describe('getAllStatuses', () => {
    it('should return all statuses', () => {
      const statuses = OrderStatus.getAllStatuses();

      expect(statuses).toHaveLength(3);
      expect(statuses).toEqual(
        expect.arrayContaining([
          OrderStatus.PENDING,
          OrderStatus.COMPLETED,
          OrderStatus.CANCELLED,
        ]),
      );
    });
  });

  describe('getAllValues', () => {
    it('should return all status values', () => {
      const values = OrderStatus.getAllValues();

      expect(values).toHaveLength(3);
      expect(values).toEqual(
        expect.arrayContaining(['PENDING', 'COMPLETED', 'CANCELLED']),
      );
    });
  });
});
