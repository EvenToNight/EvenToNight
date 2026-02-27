import * as cc from 'currency-codes';
import { InvalidCurrencyException } from '../exceptions/invalid-currency.exception';

export class Currency {
  private constructor(private readonly code: string) {}

  static fromString(value: string): Currency {
    const normalized = value.toUpperCase();
    if (!cc.code(normalized)) {
      throw new InvalidCurrencyException(value);
    }
    return new Currency(normalized);
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }

  getCode(): string {
    return this.code;
  }
}
