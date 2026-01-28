import { Ticket } from '../../../../../src/tickets/domain/aggregates/ticket.aggregate';
import { EventId } from '../../../../../src/tickets/domain/value-objects/event-id.vo';
import { UserId } from '../../../../../src/tickets/domain/value-objects/user-id.vo';
import { Money } from '../../../../../src/tickets/domain/value-objects/money.vo';
import { InvalidTicketStatusException } from '../../../../../src/tickets/domain/exceptions/invalid-ticket-status.exception';
import { TicketStatus } from '../../../../../src/tickets/domain/value-objects/ticket-status.vo';

describe('Ticket Aggregate', () => {
  const createTicket = () => {
    return Ticket.create({
      eventId: EventId.fromString('event-123'),
      userId: UserId.fromString('user-456'),
      attendeeName: 'John Doe',
      ticketTypeId: 'type-789',
      price: Money.fromAmount(50, 'USD'),
    });
  };

  const createPendingTicket = () => {
    return Ticket.createPending({
      eventId: EventId.fromString('event-123'),
      userId: UserId.fromString('user-456'),
      attendeeName: 'John Doe',
      ticketTypeId: 'type-789',
      price: Money.fromAmount(50, 'USD'),
    });
  };

  const createDefaultTicket = () => {
    return Ticket.create({
      id: 'ticket_123',
      eventId: EventId.fromString('event-123'),
      userId: UserId.fromString('user-456'),
      attendeeName: 'John Doe',
      ticketTypeId: 'type-789',
      price: Money.fromAmount(50, 'USD'),
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
      expect(ticket.getPrice().getCurrency()).toBe('USD');
      expect(ticket.getPurchaseDate().toISOString()).toBe(
        '2024-01-01T00:00:00.000Z',
      );
      expect(ticket.getStatus()).toBe(TicketStatus.ACTIVE);
    });

    it('should create a new ticket with PENDING_PAYMENT status', () => {
      const ticket = createPendingTicket();

      expect(ticket.getId()).toBeDefined();
      expect(ticket.getAttendeeName()).toBe('John Doe');
      expect(ticket.getStatus()).toBe(TicketStatus.PENDING_PAYMENT);
      expect(ticket.isPendingPayment()).toBe(true);
    });

    it('should create a new ticket with ACTIVE status by default', () => {
      const ticket = createTicket();

      expect(ticket.getId()).toBeDefined();
      expect(ticket.getAttendeeName()).toBe('John Doe');
      expect(ticket.getStatus()).toBe(TicketStatus.ACTIVE);
      expect(ticket.isActive()).toBe(true);
    });

    it('should throw error if attendee name is empty', () => {
      expect(() =>
        Ticket.create({
          eventId: EventId.fromString('event-123'),
          userId: UserId.fromString('user-456'),
          attendeeName: '        ',
          ticketTypeId: 'type-789',
          price: Money.fromAmount(50, 'USD'),
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
          price: Money.fromAmount(50, 'USD'),
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

  describe('confirmPayment', () => {
    it('should confirm payment and activate pending ticket', () => {
      const ticket = createPendingTicket();

      ticket.confirmPayment();

      expect(ticket.getStatus()).toBe(TicketStatus.ACTIVE);
      expect(ticket.isActive()).toBe(true);
    });

    it('should throw error when confirming payment for non-pending ticket', () => {
      const ticket = createTicket();

      expect(() => ticket.confirmPayment()).toThrow(
        InvalidTicketStatusException,
      );
    });
  });

  describe('markPaymentFailed', () => {
    it('should mark payment as failed for pending ticket', () => {
      const ticket = createPendingTicket();

      ticket.markPaymentFailed();

      expect(ticket.getStatus()).toBe(TicketStatus.PAYMENT_FAILED);
      expect(ticket.isPaymentFailed()).toBe(true);
    });

    it('should throw error when marking payment as failed for non-pending ticket', () => {
      const ticket = createTicket();

      expect(() => ticket.markPaymentFailed()).toThrow(
        InvalidTicketStatusException,
      );
    });
  });
});
