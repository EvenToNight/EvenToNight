import { DomainValidationException } from './domain-validation.exception';

export class InvalidEventStatusException extends DomainValidationException {
  constructor(value: string) {
    super(`Invalid EventStatus: ${value}`);
  }
}
