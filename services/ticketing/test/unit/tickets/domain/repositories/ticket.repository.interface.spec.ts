import { TICKET_REPOSITORY } from 'src/tickets/domain/repositories/ticket.repository.interface';

describe('TicketRepository', () => {
  it('should export TICKET_REPOSITORY token', () => {
    expect(typeof TICKET_REPOSITORY).toBe('symbol');
    expect(TICKET_REPOSITORY.toString()).toBe('Symbol(TICKET_REPOSITORY)');
  });
});
