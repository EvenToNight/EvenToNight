import { DomainValidationException } from './domain-validation.exception';

export class EmptyAttendeeNameException extends DomainValidationException {
  constructor() {
    super('Attendee name cannot be empty');
  }
}
