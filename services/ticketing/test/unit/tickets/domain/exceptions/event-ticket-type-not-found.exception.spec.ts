import { EventTicketTypeNotFoundException } from 'src/tickets/domain/exceptions/event-ticket-type-not-found.exception';

describe('EventTicketTypeNotFoundException', () => {
  it('should create with ticketTypeId', () => {
    const error = new EventTicketTypeNotFoundException('tt-123');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('EventTicketTypeNotFoundException');
    expect(error.message).toBe('EventTicketType with id tt-123 not found');
  });

  it('should create without ticketTypeId', () => {
    const error = new EventTicketTypeNotFoundException();
    expect(error.message).toBe('EventTicketType not found');
  });
});
