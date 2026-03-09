import { DomainValidationException } from './domain-validation.exception';

export class EmptyTicketIdException extends DomainValidationException {
  constructor() {
    super('TicketId cannot be empty');
  }
}
