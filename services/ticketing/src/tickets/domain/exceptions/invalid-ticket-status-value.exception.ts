import { DomainValidationException } from './domain-validation.exception';

export class InvalidTicketStatusValueException extends DomainValidationException {
  constructor(value: string) {
    super(`Invalid TicketStatus: ${value}`);
  }
}
