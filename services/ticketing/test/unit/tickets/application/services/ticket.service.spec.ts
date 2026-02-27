import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { TICKET_REPOSITORY } from 'src/tickets/domain/repositories/ticket.repository.interface';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';

describe('TicketService', () => {
  let service: TicketService;
  let repository: jest.Mocked<{ save: jest.Mock }>;

  beforeEach(async () => {
    repository = { save: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TICKET_REPOSITORY, useValue: repository },
      ],
    }).compile();
    service = module.get(TicketService);
  });

  describe('saveMany', () => {
    it('saves all tickets and returns them (covers line 32)', async () => {
      const ticket1 = Ticket.createPending({
        eventId: EventId.fromString('event-1'),
        userId: UserId.fromString('user-1'),
        attendeeName: 'Attendee 1',
        ticketTypeId: EventTicketTypeId.fromString('type-1'),
        price: Money.fromAmount(50, 'USD'),
      });
      const ticket2 = Ticket.createPending({
        eventId: EventId.fromString('event-1'),
        userId: UserId.fromString('user-1'),
        attendeeName: 'Attendee 2',
        ticketTypeId: EventTicketTypeId.fromString('type-1'),
        price: Money.fromAmount(50, 'USD'),
      });

      repository.save
        .mockResolvedValueOnce(ticket1)
        .mockResolvedValueOnce(ticket2);

      const result = await service.saveMany([ticket1, ticket2]);

      expect(result).toHaveLength(2);
      expect(repository.save).toHaveBeenCalledTimes(2);
    });
  });
});
