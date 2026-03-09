import { DomainConflictException } from './domain-conflict.exception';

export class SoldOutException extends DomainConflictException {
  constructor(ticketTypeName?: string) {
    super(
      ticketTypeName
        ? `Ticket type "${ticketTypeName}" is sold out`
        : 'Tickets are sold out',
    );
  }
}
