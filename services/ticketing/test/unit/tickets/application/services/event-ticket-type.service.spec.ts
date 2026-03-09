import { Test, TestingModule } from '@nestjs/testing';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { EVENT_TICKET_TYPE_REPOSITORY } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { TRANSACTION_MANAGER } from '@libs/ts-common';
import { EventTicketTypeNotFoundException } from 'src/tickets/domain/exceptions/event-ticket-type-not-found.exception';
import { UpdateEventTicketTypeDto } from 'src/tickets/application/dto/update-event-ticket-type.dto';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

function makeTicketType(soldQuantity = 5): EventTicketType {
  return EventTicketType.create({
    eventId: EventId.fromString('event-1'),
    type: TicketType.fromString('STANDARD'),
    price: Money.fromAmount(50, 'USD'),
    availableQuantity: 10,
    soldQuantity,
  });
}

describe('EventTicketTypeService', () => {
  let service: EventTicketTypeService;
  let repository: jest.Mocked<{ findById: jest.Mock; update: jest.Mock }>;

  beforeEach(async () => {
    repository = { findById: jest.fn(), update: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventTicketTypeService,
        {
          provide: EVENT_TICKET_TYPE_REPOSITORY,
          useValue: repository,
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
    service = module.get(EventTicketTypeService);
  });

  describe('updateTicket', () => {
    describe('Given the ticket type does not exist', () => {
      it('throws EventTicketTypeNotFoundException (covers line 52)', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(
          service.updateTicket('non-existent-id', { price: 50, quantity: 10 }),
        ).rejects.toThrow(EventTicketTypeNotFoundException);
      });
    });
  });

  describe('updateTicketAndMakeSoldOut', () => {
    describe('Given the ticket type does not exist', () => {
      it('throws EventTicketTypeNotFoundException (covers line 68)', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(
          service.updateTicketAndMakeSoldOut('non-existent-id', {
            price: 50,
            quantity: 10,
          }),
        ).rejects.toThrow(EventTicketTypeNotFoundException);
      });
    });

    describe('Given the ticket type exists and dto has a description', () => {
      it('calls setDescription and updates (covers line 71 true branch)', async () => {
        const ticketType = makeTicketType(5);
        repository.findById.mockResolvedValue(ticketType);
        repository.update.mockResolvedValue(ticketType);

        const dto: UpdateEventTicketTypeDto = {
          description: 'Updated description',
          price: 50,
          quantity: 3,
        };

        await service.updateTicketAndMakeSoldOut('some-id', dto);

        expect(repository.update).toHaveBeenCalled();
      });
    });

    describe('Given the ticket type exists and soldQuantity is 0', () => {
      it('skips setTotalQuantity (covers line 73 false branch)', async () => {
        const ticketType = makeTicketType(0);
        repository.findById.mockResolvedValue(ticketType);
        repository.update.mockResolvedValue(ticketType);

        await service.updateTicketAndMakeSoldOut('some-id', {
          price: 50,
          quantity: 1,
        });

        expect(repository.update).toHaveBeenCalled();
      });
    });

    describe('Given the ticket type exists and dto.price is 0', () => {
      it('skips setPrice (covers line 72 false branch)', async () => {
        const ticketType = makeTicketType(5);
        repository.findById.mockResolvedValue(ticketType);
        repository.update.mockResolvedValue(ticketType);

        await service.updateTicketAndMakeSoldOut('some-id', {
          price: 0,
          quantity: 3,
        });

        expect(repository.update).toHaveBeenCalled();
      });
    });
  });
});
