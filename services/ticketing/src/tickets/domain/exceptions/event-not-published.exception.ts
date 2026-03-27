import { DomainValidationException } from './domain-validation.exception';

export class EventNotPublishedException extends DomainValidationException {
  constructor(eventId: string) {
    super(
      `Cannot reserve tickets for event ${eventId} because it is not published`,
    );
  }
}
