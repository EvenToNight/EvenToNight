import { DomainConflictException } from './domain-conflict.exception';

export class TicketTypeAlreadyExistsException extends DomainConflictException {
  constructor(type: string, eventId: string) {
    super(`Ticket type '${type}' already exists for event '${eventId}'`);
  }
}
