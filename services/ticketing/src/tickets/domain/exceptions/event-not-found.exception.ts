import { DomainNotFoundException } from './domain-not-found.exception';

export class EventNotFoundException extends DomainNotFoundException {
  constructor(eventId?: string) {
    super(eventId ? `Event with id ${eventId} not found` : 'Event not found');
  }
}
