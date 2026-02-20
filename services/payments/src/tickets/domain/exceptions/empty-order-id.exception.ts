import { DomainValidationException } from './domain-validation.exception';

export class EmptyOrderIdException extends DomainValidationException {
  constructor() {
    super('OrderId cannot be empty');
  }
}
