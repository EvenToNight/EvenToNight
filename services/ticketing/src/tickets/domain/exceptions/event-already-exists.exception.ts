import { DomainConflictException } from './domain-conflict.exception';

export class EventAlreadyExistsException extends DomainConflictException {
  constructor(eventId: string) {
    super(`Event with id ${eventId} already exists`);
  }
}
