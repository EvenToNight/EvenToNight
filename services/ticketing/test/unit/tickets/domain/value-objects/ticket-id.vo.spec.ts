import { TicketId } from 'src/tickets/domain/value-objects/ticket-id.vo';
import { EmptyTicketIdException } from 'src/tickets/domain/exceptions/empty-ticket-id.exception';

describe('TicketId', () => {
  it('should create from valid string', () => {
    const id = TicketId.fromString('ticket_123');
    expect(id.getValue()).toBe('ticket_123');
    expect(id.toString()).toBe('ticket_123');
  });

  it('should throw EmptyTicketIdException for empty string', () => {
    expect(() => TicketId.fromString('')).toThrow(EmptyTicketIdException);
  });

  it('should throw EmptyTicketIdException for whitespace', () => {
    expect(() => TicketId.fromString('   ')).toThrow(EmptyTicketIdException);
  });

  it('should return true for equal ids', () => {
    const a = TicketId.fromString('ticket_1');
    const b = TicketId.fromString('ticket_1');
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for different ids', () => {
    const a = TicketId.fromString('ticket_1');
    const b = TicketId.fromString('ticket_2');
    expect(a.equals(b)).toBe(false);
  });
});
