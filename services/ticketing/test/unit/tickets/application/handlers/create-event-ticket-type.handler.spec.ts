import { Test, TestingModule } from '@nestjs/testing';
import { CreateEventTicketTypeHandler } from 'src/tickets/application/handlers/create-event-ticket-type.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { EventService } from 'src/tickets/application/services/event.service';
import { OutboxService } from '@libs/nestjs-common';
import { TRANSACTION_MANAGER } from '@libs/ts-common';
import { EventNotFoundException } from 'src/tickets/domain/exceptions/event-not-found.exception';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

describe('CreateEventTicketTypeHandler', () => {
  let handler: CreateEventTicketTypeHandler;
  let eventService: jest.Mocked<Pick<EventService, 'findById'>>;
  let eventTicketTypeService: jest.Mocked<Pick<EventTicketTypeService, 'save'>>;
  let outboxService: jest.Mocked<Pick<OutboxService, 'addEvent'>>;

  const makeSavedTicketType = (): EventTicketType =>
    EventTicketType.create({
      eventId: EventId.fromString('event-1'),
      type: TicketType.fromString('STANDARD'),
      description: 'desc',
      price: Money.fromAmount(50, 'USD'),
      availableQuantity: 100,
      soldQuantity: 0,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEventTicketTypeHandler,
        {
          provide: EventTicketTypeService,
          useValue: { save: jest.fn() },
        },
        {
          provide: EventService,
          useValue: { findById: jest.fn() },
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

    handler = module.get(CreateEventTicketTypeHandler);
    eventService = module.get(EventService);
    eventTicketTypeService = module.get(EventTicketTypeService);
    outboxService = module.get(OutboxService);
  });

  describe('Given the event does not exist', () => {
    it('throws EventNotFoundException without saving', async () => {
      eventService.findById.mockResolvedValue(null);

      await expect(
        handler.handle('non-existent-event', {
          type: 'STANDARD',
          description: 'desc',
          price: 50,
          quantity: 100,
        }),
      ).rejects.toThrow(EventNotFoundException);

      expect(eventTicketTypeService.save).not.toHaveBeenCalled();
      expect(outboxService.addEvent).not.toHaveBeenCalled();
    });
  });

  describe('Given the event exists', () => {
    it('creates the ticket type and publishes an outbox event', async () => {
      const savedTicketType = makeSavedTicketType();
      eventService.findById.mockResolvedValue({} as never);
      eventTicketTypeService.save.mockResolvedValue(savedTicketType);
      outboxService.addEvent.mockResolvedValue(undefined as never);

      const result = await handler.handle('event-1', {
        type: 'STANDARD',
        description: 'desc',
        price: 50,
        quantity: 100,
      });

      expect(result).toBe(savedTicketType);
      expect(eventTicketTypeService.save).toHaveBeenCalled();
      expect(outboxService.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'ticket-type.created' }),
        'ticket-type.created',
      );
    });
  });
});
