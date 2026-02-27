import { SoldOutException } from 'src/tickets/domain/exceptions/sold-out.exception';

describe('SoldOutException', () => {
  it('should create with ticketTypeName', () => {
    const error = new SoldOutException('VIP');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SoldOutException');
    expect(error.message).toBe('Ticket type "VIP" is sold out');
  });

  it('should create without ticketTypeName', () => {
    const error = new SoldOutException();
    expect(error.message).toBe('Tickets are sold out');
  });
});
