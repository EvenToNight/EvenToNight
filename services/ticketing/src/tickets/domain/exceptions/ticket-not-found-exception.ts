import { DomainNotFoundException } from './domain-not-found.exception';

export class TicketNotFoundException extends DomainNotFoundException {
  constructor(ticketId?: string) {
    super(
      ticketId ? `Ticket with id ${ticketId} not found` : 'Ticket not found',
    );
  }
}
