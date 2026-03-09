import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { SoldOutException } from 'src/tickets/domain/exceptions/sold-out.exception';
import { NegativeSoldQuantityException } from 'src/tickets/domain/exceptions/negative-sold-quantity.exception';
import { NegativeAvailableQuantityException } from 'src/tickets/domain/exceptions/negative-available-quantity.exception';
import { InsufficientTotalQuantityException } from 'src/tickets/domain/exceptions/insufficient-total-quantity.exception';

describe('EventTicketType Aggregate', () => {
  const DEFAULT_AVAILABLE_QUANTITY = 10;
  const DEFAULT_SOLD_QUANTITY = 10;

  const createTicketType = () => {
    return EventTicketType.create({
      eventId: EventId.fromString('event-123'),
      type: TicketType.VIP,
      description: 'VIP Access',
      price: Money.fromAmount(100, 'USD'),
      availableQuantity: DEFAULT_AVAILABLE_QUANTITY,
    });
  };

  const createDefaultTicketType = (
    availableQuantity = DEFAULT_AVAILABLE_QUANTITY,
    soldQuantity = DEFAULT_SOLD_QUANTITY,
  ) => {
    return EventTicketType.create({
      id: EventTicketTypeId.fromString('ett_123'),
      eventId: EventId.fromString('event-123'),
      type: TicketType.VIP,
      description: 'VIP Access',
      price: Money.fromAmount(100, 'USD'),
      availableQuantity,
      soldQuantity,
    });
  };

  describe('create', () => {
    it('should create a new ticket type', () => {
      const ticketType = createTicketType();

      expect(ticketType.getId()).toBeDefined();
      expect(ticketType.getEventId().toString()).toBe('event-123');
      expect(ticketType.getType()).toBe(TicketType.VIP);
      expect(ticketType.getType().toString()).toBe('VIP');
      expect(ticketType.getAvailableQuantity()).toBe(
        DEFAULT_AVAILABLE_QUANTITY,
      );
      expect(ticketType.getSoldQuantity()).toBe(0);
      expect(ticketType.isSoldOut()).toBe(false);
    });

    it('should create a ticket type with specified id and sold quantity', () => {
      const ticketType = createDefaultTicketType();
      expect(ticketType.getId().toString()).toBe('ett_123');
      expect(ticketType.getSoldQuantity()).toBe(DEFAULT_SOLD_QUANTITY);
    });
  });

  describe('reserveTicket', () => {
    it('should reserve a ticket and update quantities', () => {
      const ticketType = createDefaultTicketType();

      ticketType.reserveTicket();

      expect(ticketType.getAvailableQuantity()).toBe(
        DEFAULT_AVAILABLE_QUANTITY - 1,
      );
      expect(ticketType.getSoldQuantity()).toBe(DEFAULT_SOLD_QUANTITY + 1);
    });

    it('should throw SoldOutException when no tickets available', () => {
      const ticketType = createDefaultTicketType(0);
      expect(() => ticketType.reserveTicket()).toThrow(SoldOutException);
    });

    it('should throw SoldOutException after selling all tickets', () => {
      const ticketType = createDefaultTicketType(1);

      ticketType.reserveTicket();
      expect(ticketType.isSoldOut()).toBe(true);

      expect(() => ticketType.reserveTicket()).toThrow(SoldOutException);
    });
  });

  describe('releaseTicket', () => {
    it('should release a ticket and restore quantities', () => {
      const ticketType = createDefaultTicketType();

      ticketType.reserveTicket();
      ticketType.releaseTicket();

      expect(ticketType.getAvailableQuantity()).toBe(
        DEFAULT_AVAILABLE_QUANTITY,
      );
      expect(ticketType.getSoldQuantity()).toBe(DEFAULT_SOLD_QUANTITY);
    });

    it('should allow reserving after releasing', () => {
      const ticketType = createDefaultTicketType(1);

      ticketType.reserveTicket();
      expect(ticketType.isSoldOut()).toBe(true);

      ticketType.releaseTicket();
      expect(ticketType.isSoldOut()).toBe(false);

      expect(() => ticketType.reserveTicket()).not.toThrow();
    });
  });

  describe('isSoldOut', () => {
    it('should return true when available quantity is 0', () => {
      const ticketType = createDefaultTicketType(0);

      expect(ticketType.isSoldOut()).toBe(true);
    });

    it('should return false when tickets are available', () => {
      const ticketType = createDefaultTicketType();

      expect(ticketType.isSoldOut()).toBe(false);
    });
  });

  describe('getTotalQuantity', () => {
    it('should return sum of available and sold quantities', () => {
      const ticketType = createDefaultTicketType();

      ticketType.reserveTicket();
      ticketType.reserveTicket();

      expect(ticketType.getTotalQuantity()).toBe(
        DEFAULT_AVAILABLE_QUANTITY + DEFAULT_SOLD_QUANTITY,
      );
      expect(ticketType.getAvailableQuantity()).toBe(
        DEFAULT_AVAILABLE_QUANTITY - 2,
      );
      expect(ticketType.getSoldQuantity()).toBe(DEFAULT_SOLD_QUANTITY + 2);
    });
  });

  describe('invariants', () => {
    it('should throw NegativeAvailableQuantityException for negative available quantity', () => {
      expect(() => createDefaultTicketType(-1)).toThrow(
        NegativeAvailableQuantityException,
      );
    });

    it('should throw NegativeSoldQuantityException for negative sold quantity', () => {
      expect(() => createDefaultTicketType(0, -1)).toThrow(
        NegativeSoldQuantityException,
      );
    });
  });

  describe('setTotalQuantity', () => {
    it('should update available quantity', () => {
      const ticketType = createDefaultTicketType(10, 5);
      ticketType.setTotalQuantity(20);
      expect(ticketType.getAvailableQuantity()).toBe(15);
    });

    it('should throw InsufficientTotalQuantityException when less than sold', () => {
      const ticketType = createDefaultTicketType(10, 5);
      expect(() => ticketType.setTotalQuantity(3)).toThrow(
        InsufficientTotalQuantityException,
      );
    });
  });

  describe('setters', () => {
    it('should set description', () => {
      const ticketType = createDefaultTicketType();
      ticketType.setDescription('New description');
      expect(ticketType.getDescription()).toBe('New description');
    });

    it('should set description to undefined', () => {
      const ticketType = createDefaultTicketType();
      ticketType.setDescription(undefined);
      expect(ticketType.getDescription()).toBeUndefined();
    });

    it('should set price', () => {
      const ticketType = createDefaultTicketType();
      const newPrice = Money.fromAmount(200, 'EUR');
      ticketType.setPrice(newPrice);
      expect(ticketType.getPrice()).toBe(newPrice);
    });
  });
});
