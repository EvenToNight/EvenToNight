import { DomainValidationException } from './domain-validation.exception';

export class InvalidTicketTypeException extends DomainValidationException {
  constructor(value: string) {
    super(`Invalid TicketType: ${value}`);
  }
}
