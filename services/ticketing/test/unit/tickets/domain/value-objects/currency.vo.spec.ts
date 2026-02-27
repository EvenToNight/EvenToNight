import { Currency } from 'src/tickets/domain/value-objects/currency.vo';
import { InvalidCurrencyException } from 'src/tickets/domain/exceptions/invalid-currency.exception';

describe('Currency Value Object', () => {
  describe('fromString', () => {
    it('should create currency from valid ISO 4217 code', () => {
      const currency = Currency.fromString('EUR');

      expect(currency.getCode()).toBe('EUR');
    });

    it('should normalize to uppercase', () => {
      const currency = Currency.fromString('usd');

      expect(currency.getCode()).toBe('USD');
    });

    it('should accept GBP', () => {
      const currency = Currency.fromString('GBP');

      expect(currency.getCode()).toBe('GBP');
    });

    it('should throw for invalid currency code', () => {
      expect(() => Currency.fromString('INVALID')).toThrow(
        InvalidCurrencyException,
      );
    });

    it('should throw for empty string', () => {
      expect(() => Currency.fromString('')).toThrow(InvalidCurrencyException);
    });
  });

  describe('equals', () => {
    it('should return true for same currency', () => {
      const c1 = Currency.fromString('EUR');
      const c2 = Currency.fromString('EUR');

      expect(c1.equals(c2)).toBe(true);
    });

    it('should return false for different currencies', () => {
      const c1 = Currency.fromString('EUR');
      const c2 = Currency.fromString('USD');

      expect(c1.equals(c2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the currency code', () => {
      const currency = Currency.fromString('EUR');

      expect(currency.toString()).toBe('EUR');
    });
  });
});
