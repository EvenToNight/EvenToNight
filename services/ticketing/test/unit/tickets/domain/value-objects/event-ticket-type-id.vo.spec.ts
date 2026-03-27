import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { EmptyEventTicketTypeIdException } from 'src/tickets/domain/exceptions/empty-event-ticket-type-id.exception';

describe('EventTicketTypeId', () => {
  it('should create from valid string', () => {
    const id = EventTicketTypeId.fromString('ett_123');
    expect(id.getValue()).toBe('ett_123');
    expect(id.toString()).toBe('ett_123');
  });

  it('should throw EmptyEventTicketTypeIdException for empty string', () => {
    expect(() => EventTicketTypeId.fromString('')).toThrow(
      EmptyEventTicketTypeIdException,
    );
  });

  it('should throw EmptyEventTicketTypeIdException for whitespace', () => {
    expect(() => EventTicketTypeId.fromString('   ')).toThrow(
      EmptyEventTicketTypeIdException,
    );
  });

  it('should return true for equal ids', () => {
    const a = EventTicketTypeId.fromString('ett_1');
    const b = EventTicketTypeId.fromString('ett_1');
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for different ids', () => {
    const a = EventTicketTypeId.fromString('ett_1');
    const b = EventTicketTypeId.fromString('ett_2');
    expect(a.equals(b)).toBe(false);
  });
});
