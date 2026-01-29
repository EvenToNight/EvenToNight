import { Money } from '../../../../../src/tickets/domain/value-objects/money.vo';

describe('Money Value Object', () => {
  describe('fromAmount', () => {
    it('should create money with amount and currency', () => {
      const money = Money.fromAmount(50, 'USD');

      expect(money.getAmount()).toBe(50);
      expect(money.getCurrency()).toBe('USD');
    });

    it('should use USD as default currency', () => {
      const money = Money.fromAmount(100);

      expect(money.getCurrency()).toBe('USD');
    });

    it('should throw error for negative amount', () => {
      expect(() => Money.fromAmount(-10, 'USD')).toThrow(
        'Amount cannot be negative',
      );
    });

    it('should throw error for invalid currency', () => {
      expect(() => Money.fromAmount(50, 'U')).toThrow(
        'Currency must be a valid 3-letter code',
      );
    });

    it('should accept zero amount', () => {
      const money = Money.fromAmount(0, 'USD');

      expect(money.getAmount()).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true for same amount and currency', () => {
      const money1 = Money.fromAmount(50, 'USD');
      const money2 = Money.fromAmount(50, 'USD');

      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = Money.fromAmount(50, 'USD');
      const money2 = Money.fromAmount(100, 'USD');

      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = Money.fromAmount(50, 'USD');
      const money2 = Money.fromAmount(50, 'EUR');

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const money = Money.fromAmount(50, 'USD');
      const json = money.toJSON();

      expect(json).toEqual({ amount: 50, currency: 'USD' });
    });
  });

  describe('toString', () => {
    it('should format as string', () => {
      const money = Money.fromAmount(50, 'USD');

      expect(money.toString()).toBe('50 USD');
    });
  });
});
