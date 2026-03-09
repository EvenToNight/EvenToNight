import { EVENT_TICKET_TYPE_REPOSITORY } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';

describe('EventTicketTypeRepository', () => {
  it('should export EVENT_TICKET_TYPE_REPOSITORY token', () => {
    expect(typeof EVENT_TICKET_TYPE_REPOSITORY).toBe('symbol');
    expect(EVENT_TICKET_TYPE_REPOSITORY.toString()).toBe(
      'Symbol(EVENT_TICKET_TYPE_REPOSITORY)',
    );
  });
});
