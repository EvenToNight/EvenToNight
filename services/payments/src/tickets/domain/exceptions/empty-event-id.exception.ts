import { DomainValidationException } from './domain-validation.exception';

export class EmptyEventIdException extends DomainValidationException {
  constructor() {
    super('EventId cannot be empty');
  }
}
