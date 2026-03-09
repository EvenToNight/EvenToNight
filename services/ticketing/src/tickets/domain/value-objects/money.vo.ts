import { NegativeAmountException } from '../exceptions/negative-amount.exception';
import { Currency } from './currency.vo';

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency,
  ) {
    if (amount < 0) {
      throw new NegativeAmountException();
    }
  }

  static fromAmount(amount: number, currency: string = 'USD'): Money {
    return new Money(amount, Currency.fromString(currency));
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency.getCode();
  }

  toJSON(): { amount: number; currency: string } {
    return { amount: this.amount, currency: this.currency.getCode() };
  }

  toString(): string {
    return `${this.amount} ${this.currency.toString()}`;
  }
}
