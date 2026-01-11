import { Ticket } from '../../../../src/tickets/domain/aggregates/ticket.aggregate';
import { EventId } from '../../../../src/tickets/domain/value-objects/event-id.vo';
import { UserId } from '../../../../src/tickets/domain/value-objects/user-id.vo';
import { Money } from '../../../../src/tickets/domain/value-objects/money.vo';
import { InvalidTicketStatusException } from '../../../../src/tickets/domain/exceptions/invalid-ticket-status.exception';
import { TicketStatus } from '../../../../src/tickets/domain/value-objects/ticket-status.vo';

describe('Ticket Aggregate', () => {
  const createTicket = () => {
    return Ticket.create({
      eventId: EventId.fromString('event-123'),
      userId: UserId.fromString('user-456'),
      attendeeName: 'John Doe',
      ticketTypeId: 'type-789',
      price: Money.fromAmount(50, 'EUR'),
    });
  };

  const createDefaultTicket = () => {
    return Ticket.create({
      id: 'ticket_123',
      eventId: EventId.fromString('event-123'),
      userId: UserId.fromString('user-456'),
      attendeeName: 'John Doe',
      ticketTypeId: 'type-789',
      price: Money.fromAmount(50, 'EUR'),
      purchaseDate: new Date('2024-01-01T00:00:00Z'),
      status: TicketStatus.ACTIVE,
    });
  };

  describe('create', () => {
    it('should create a new ticket with provided parameters', () => {
      const ticket = createDefaultTicket();

      expect(ticket.getId()).toBe('ticket_123');
      expect(ticket.getEventId().toString()).toBe('event-123');
      expect(ticket.getUserId().toString()).toBe('user-456');
      expect(ticket.getAttendeeName()).toBe('John Doe');
      expect(ticket.getTicketTypeId()).toBe('type-789');
      expect(ticket.getPrice().getAmount()).toBe(50);
      expect(ticket.getPrice().getCurrency()).toBe('EUR');
      expect(ticket.getPurchaseDate().toISOString()).toBe(
        '2024-01-01T00:00:00.000Z',
      );
      expect(ticket.getStatus().toString()).toBe('ACTIVE');
    });

    it('should create a new ticket with ACTIVE status by default', () => {
      const ticket = createTicket();

      expect(ticket.getId()).toBeDefined();
      expect(ticket.getStatus().toString()).toBe('ACTIVE');
      expect(ticket.getAttendeeName()).toBe('John Doe');
      expect(ticket.isActive()).toBe(true);
    });

    it('should throw error if attendee name is empty', () => {
      expect(() =>
        Ticket.create({
          eventId: EventId.fromString('event-123'),
          userId: UserId.fromString('user-456'),
          attendeeName: '        ',
          ticketTypeId: 'type-789',
          price: Money.fromAmount(50, 'EUR'),
        }),
      ).toThrow('Attendee name cannot be empty');
    });

    it('should throw error if ticket type ID is empty', () => {
      expect(() =>
        Ticket.create({
          eventId: EventId.fromString('event-123'),
          userId: UserId.fromString('user-456'),
          attendeeName: 'John Doe',
          ticketTypeId: '        ',
          price: Money.fromAmount(50, 'EUR'),
        }),
      ).toThrow('Ticket type ID cannot be empty');
    });
  });

  describe('cancel', () => {
    it('should cancel an active ticket', () => {
      const ticket = createTicket();

      ticket.cancel();

      expect(ticket.getStatus()).toBe(TicketStatus.CANCELLED);
      expect(ticket.isCancelled()).toBe(true);
      expect(ticket.isActive()).toBe(false);
    });

    it('should throw error when cancelling already cancelled ticket', () => {
      const ticket = createTicket();
      ticket.cancel();

      expect(() => ticket.cancel()).toThrow(InvalidTicketStatusException);
    });
  });

  describe('refund', () => {
    it('should refund an active ticket', () => {
      const ticket = createTicket();

      ticket.refund();

      expect(ticket.getStatus()).toBe(TicketStatus.REFUNDED);
      expect(ticket.isRefunded()).toBe(true);
    });

    it('should throw error when refunding cancelled ticket', () => {
      const ticket = createTicket();
      ticket.cancel();

      expect(() => ticket.refund()).toThrow(InvalidTicketStatusException);
    });
  });

  describe('transferTo', () => {
    it('should transfer active ticket to new attendee', () => {
      const ticket = createTicket();

      ticket.transferTo('Jane Smith');

      expect(ticket.getAttendeeName()).toBe('Jane Smith');
      expect(ticket.getStatus()).toBe(TicketStatus.ACTIVE);
    });

    it('should throw error when transferring cancelled ticket', () => {
      const ticket = createTicket();
      ticket.cancel();

      expect(() => ticket.transferTo('Jane Smith')).toThrow(
        InvalidTicketStatusException,
      );
    });

    it('should throw error when transferring refunded ticket', () => {
      const ticket = createTicket();
      ticket.refund();

      expect(() => ticket.transferTo('Jane Smith')).toThrow(
        InvalidTicketStatusException,
      );
    });

    it('should throw error when new attendee name is empty', () => {
      const ticket = createTicket();

      expect(() => ticket.transferTo(' ')).toThrow(
        'Attendee name cannot be empty',
      );
    });
  });
});
