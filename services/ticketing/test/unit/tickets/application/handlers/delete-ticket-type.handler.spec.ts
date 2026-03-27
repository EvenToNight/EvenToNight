import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTicketTypeHandler } from 'src/tickets/application/handlers/delete-ticket-type.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { EventService } from 'src/tickets/application/services/event.service';
import { OutboxService } from '@libs/nestjs-common';
import { TRANSACTION_MANAGER } from '@libs/ts-common';

describe('DeleteTicketTypeHandler', () => {
  let handler: DeleteTicketTypeHandler;
  let eventTicketTypeService: jest.Mocked<
    Pick<EventTicketTypeService, 'findById' | 'findByEventId' | 'delete'>
  >;
  let ticketService: jest.Mocked<Pick<TicketService, 'revokeTickets'>>;
  let eventService: jest.Mocked<Pick<EventService, 'delete'>>;
  let outboxService: jest.Mocked<Pick<OutboxService, 'addEvent'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTicketTypeHandler,
        {
          provide: EventTicketTypeService,
          useValue: {
            findById: jest.fn(),
            findByEventId: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: TicketService,
          useValue: { revokeTickets: jest.fn() },
        },
        {
          provide: EventService,
          useValue: { delete: jest.fn() },
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

    handler = module.get(DeleteTicketTypeHandler);
    eventTicketTypeService = module.get(EventTicketTypeService);
    ticketService = module.get(TicketService);
    eventService = module.get(EventService);
    outboxService = module.get(OutboxService);
  });

  describe('Given the ticket type does not exist', () => {
    it('returns early without performing any deletions', async () => {
      eventTicketTypeService.findById.mockResolvedValue(null);

      await expect(handler.handle('non-existent-id')).resolves.toBeUndefined();

      expect(eventTicketTypeService.findByEventId).not.toHaveBeenCalled();
      expect(eventTicketTypeService.delete).not.toHaveBeenCalled();
      expect(ticketService.revokeTickets).not.toHaveBeenCalled();
      expect(outboxService.addEvent).not.toHaveBeenCalled();
      expect(eventService.delete).not.toHaveBeenCalled();
    });
  });
});
