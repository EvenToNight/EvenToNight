export class InvalidCurrencyException extends Error {
  constructor(value: string) {
    super(`Invalid currency code: ${value}`);
    this.name = 'InvalidCurrencyException';
  }
}
