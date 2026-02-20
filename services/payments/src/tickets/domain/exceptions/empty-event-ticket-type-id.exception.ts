import { DomainValidationException } from './domain-validation.exception';

export class EmptyEventTicketTypeIdException extends DomainValidationException {
  constructor() {
    super('EventTicketTypeId cannot be empty');
  }
}
