import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from 'src/tickets/application/services/event.service';
import { EVENT_REPOSITORY } from 'src/tickets/domain/repositories/event.repository.interface';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

describe('EventService', () => {
  let service: EventService;
  let repository: jest.Mocked<{
    findById: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  }>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EVENT_REPOSITORY, useValue: repository },
      ],
    }).compile();
    service = module.get(EventService);
  });

  describe('createOrUpdate', () => {
    describe('Given the event already exists in the repository', () => {
      it('calls eventRepository.update instead of save (covers line 33)', async () => {
        const existingEvent = Event.create({
          id: EventId.fromString('event-1'),
          creatorId: UserId.fromString('creator-1'),
          status: EventStatus.PUBLISHED,
          date: new Date(),
        });
        repository.findById.mockResolvedValue(existingEvent);
        repository.update.mockResolvedValue(existingEvent);

        await service.createOrUpdate(
          'event-1',
          'creator-1',
          'PUBLISHED',
          new Date(),
        );

        expect(repository.update).toHaveBeenCalled();
        expect(repository.save).not.toHaveBeenCalled();
      });
    });
  });
});
