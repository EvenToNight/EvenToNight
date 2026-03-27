import { DomainNotFoundException } from './domain-not-found.exception';

export class EventTicketTypeNotFoundException extends DomainNotFoundException {
  constructor(ticketTypeId?: string) {
    super(
      ticketTypeId
        ? `EventTicketType with id ${ticketTypeId} not found`
        : 'EventTicketType not found',
    );
  }
}
