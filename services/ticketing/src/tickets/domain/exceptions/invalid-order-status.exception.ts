import { DomainValidationException } from './domain-validation.exception';

export class InvalidOrderStatusException extends DomainValidationException {
  constructor(value: string) {
    super(`Invalid OrderStatus: ${value}`);
  }
}
