import { DomainValidationException } from './domain-validation.exception';

export class EmptyOrderTicketsException extends DomainValidationException {
  constructor() {
    super('Order must contain at least one ticket');
  }
}
