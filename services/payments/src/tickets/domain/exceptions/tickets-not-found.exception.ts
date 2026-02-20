import { DomainNotFoundException } from './domain-not-found.exception';

export class TicketsNotFoundException extends DomainNotFoundException {
  constructor(message?: string) {
    super(message ?? 'No tickets found');
  }
}
