import { DomainValidationException } from './domain-validation.exception';

export class NegativeSoldQuantityException extends DomainValidationException {
  constructor() {
    super('Sold quantity cannot be negative');
  }
}
