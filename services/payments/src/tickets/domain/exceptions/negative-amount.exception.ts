import { DomainValidationException } from './domain-validation.exception';

export class NegativeAmountException extends DomainValidationException {
  constructor() {
    super('Amount cannot be negative');
  }
}
