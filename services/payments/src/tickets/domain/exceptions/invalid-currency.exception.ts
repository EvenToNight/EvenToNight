import { DomainValidationException } from './domain-validation.exception';

export class InvalidCurrencyException extends DomainValidationException {
  constructor(value: string) {
    super(`Invalid currency code: ${value}`);
  }
}
