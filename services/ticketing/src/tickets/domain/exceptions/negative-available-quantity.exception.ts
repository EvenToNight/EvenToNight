import { DomainValidationException } from './domain-validation.exception';

export class NegativeAvailableQuantityException extends DomainValidationException {
  constructor() {
    super('Available quantity cannot be negative');
  }
}
