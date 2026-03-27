import { Test, TestingModule } from '@nestjs/testing';
import { VerifyTicketHandler } from 'src/tickets/application/handlers/verify-ticket.handler';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { TRANSACTION_MANAGER } from '@libs/ts-common';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { TicketNotFoundException } from 'src/tickets/domain/exceptions/ticket-not-found-exception';

describe('VerifyTicketHandler', () => {
  let handler: VerifyTicketHandler;
  let ticketService: jest.Mocked<Pick<TicketService, 'findById' | 'update'>>;

  const makeTicket = (status: TicketStatus): Ticket =>
    Ticket.create({
      eventId: EventId.fromString('event-1'),
      userId: UserId.fromString('user-1'),
      attendeeName: 'John Doe',
      ticketTypeId: EventTicketTypeId.fromString('type-1'),
      price: Money.fromAmount(10, 'USD'),
      status,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyTicketHandler,
        {
          provide: TicketService,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        {
          provide: TRANSACTION_MANAGER,
          useValue: {
            executeInTransaction: jest
              .fn()
              .mockImplementation((fn: () => unknown) => fn()),
          },
        },
      ],
    }).compile();

    handler = module.get(VerifyTicketHandler);
    ticketService = module.get(TicketService);
  });

  describe('Given the ticket does not exist', () => {
    it('throws an error with message "Ticket not found"', async () => {
      ticketService.findById.mockResolvedValue(null);

      await expect(handler.handle('non-existent-id')).rejects.toThrow(
        TicketNotFoundException,
      );
    });
  });

  describe('Given the ticket has already been used', () => {
    it('returns false without calling update', async () => {
      const ticket = makeTicket(TicketStatus.USED);
      ticketService.findById.mockResolvedValue(ticket);

      const result = await handler.handle(ticket.getId().toString());

      expect(result).toBe(false);
      expect(ticketService.update).not.toHaveBeenCalled();
    });
  });

  describe('Given the ticket is active', () => {
    it('marks the ticket as used and returns true', async () => {
      const ticket = makeTicket(TicketStatus.ACTIVE);
      ticketService.findById.mockResolvedValue(ticket);
      ticketService.update.mockResolvedValue(ticket);

      const result = await handler.handle(ticket.getId().toString());

      expect(result).toBe(true);
      expect(ticketService.update).toHaveBeenCalledWith(ticket);
      expect(ticket.isUsed()).toBe(true);
    });
  });
});
