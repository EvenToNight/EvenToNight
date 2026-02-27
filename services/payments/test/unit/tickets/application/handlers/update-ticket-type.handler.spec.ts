import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTicketTypeHandler } from 'src/tickets/application/handlers/update-ticket-type.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { OutboxService } from '@libs/nestjs-common';
import { TRANSACTION_MANAGER } from '@libs/ts-common';
import { EventTicketTypeNotFoundException } from 'src/tickets/domain/exceptions/event-ticket-type-not-found.exception';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

describe('UpdateTicketTypeHandler', () => {
  let handler: UpdateTicketTypeHandler;
  let eventTicketTypeService: jest.Mocked<
    Pick<
      EventTicketTypeService,
      'findById' | 'updateTicket' | 'updateTicketAndMakeSoldOut'
    >
  >;
  let outboxService: jest.Mocked<Pick<OutboxService, 'addEvent'>>;

  const makeTicketType = (soldQuantity: number): EventTicketType =>
    EventTicketType.create({
      eventId: EventId.fromString('event-1'),
      type: TicketType.fromString('STANDARD'),
      description: 'desc',
      price: Money.fromAmount(50, 'USD'),
      availableQuantity: 100,
      soldQuantity,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTicketTypeHandler,
        {
          provide: EventTicketTypeService,
          useValue: {
            findById: jest.fn(),
            updateTicket: jest.fn(),
            updateTicketAndMakeSoldOut: jest.fn(),
          },
        },
        {
          provide: OutboxService,
          useValue: { addEvent: jest.fn() },
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

    handler = module.get(UpdateTicketTypeHandler);
    eventTicketTypeService = module.get(EventTicketTypeService);
    outboxService = module.get(OutboxService);
  });

  describe('Given the ticket type does not exist', () => {
    it('throws EventTicketTypeNotFoundException', async () => {
      eventTicketTypeService.findById.mockResolvedValue(null);

      await expect(
        handler.handle('non-existent-id', { price: 50, quantity: 100 }),
      ).rejects.toThrow(EventTicketTypeNotFoundException);

      expect(eventTicketTypeService.updateTicket).not.toHaveBeenCalled();
      expect(
        eventTicketTypeService.updateTicketAndMakeSoldOut,
      ).not.toHaveBeenCalled();
    });
  });

  describe('Given the new quantity is less than soldQuantity', () => {
    it('delegates to updateTicketAndMakeSoldOut without publishing an outbox event', async () => {
      const ticketType = makeTicketType(5); // soldQuantity = 5
      eventTicketTypeService.findById.mockResolvedValue(ticketType);
      eventTicketTypeService.updateTicketAndMakeSoldOut.mockResolvedValue(
        ticketType,
      );

      await handler.handle('some-id', { price: 50, quantity: 3 }); // quantity 3 < soldQuantity 5

      expect(
        eventTicketTypeService.updateTicketAndMakeSoldOut,
      ).toHaveBeenCalledWith(
        'some-id',
        expect.objectContaining({ quantity: 3 }),
      );
      expect(eventTicketTypeService.updateTicket).not.toHaveBeenCalled();
      expect(outboxService.addEvent).not.toHaveBeenCalled();
    });
  });

  describe('Given the new quantity is greater than or equal to soldQuantity', () => {
    it('delegates to updateTicket and publishes a ticket-type.updated outbox event', async () => {
      const ticketType = makeTicketType(5);
      eventTicketTypeService.findById.mockResolvedValue(ticketType);
      eventTicketTypeService.updateTicket.mockResolvedValue(ticketType);
      outboxService.addEvent.mockResolvedValue(undefined as never);

      await handler.handle('some-id', { price: 75, quantity: 100 });

      expect(eventTicketTypeService.updateTicket).toHaveBeenCalledWith(
        'some-id',
        expect.objectContaining({ price: 75, quantity: 100 }),
      );
      expect(
        eventTicketTypeService.updateTicketAndMakeSoldOut,
      ).not.toHaveBeenCalled();
      expect(outboxService.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'ticket-type.updated' }),
        'ticket-type.updated',
      );
    });
  });
});
