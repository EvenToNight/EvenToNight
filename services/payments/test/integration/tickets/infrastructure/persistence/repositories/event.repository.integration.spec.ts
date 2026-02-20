import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { EventRepositoryImpl } from 'src/tickets/infrastructure/persistence/repositories/event.repository';
import {
  EventDocument,
  EventSchema,
} from 'src/tickets/infrastructure/persistence/schemas/event.schema';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

describe('EventRepositoryImpl (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repo: EventRepositoryImpl;
  let eventModel: Model<EventDocument>;

  const makeEvent = (
    overrides: {
      id?: string;
      status?: EventStatus;
      date?: Date;
      title?: string;
    } = {},
  ): Event =>
    Event.create({
      id: EventId.fromString(overrides.id ?? 'ev-1'),
      creatorId: UserId.fromString('creator-1'),
      status: overrides.status ?? EventStatus.PUBLISHED,
      date: overrides.date ?? new Date('2025-06-01'),
      title: overrides.title ?? 'Test Event',
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: EventDocument.name, schema: EventSchema },
        ]),
      ],
      providers: [EventRepositoryImpl],
    }).compile();

    repo = module.get(EventRepositoryImpl);
    eventModel = module.get<Model<EventDocument>>(
      getModelToken(EventDocument.name),
    );
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await eventModel.deleteMany({});
  });

  describe('save + findById', () => {
    it('saves an event and retrieves it by ID', async () => {
      const event = makeEvent({ id: 'ev-save' });
      await repo.save(event);

      const found = await repo.findById('ev-save');
      expect(found).not.toBeNull();
      expect(found!.getId().toString()).toBe('ev-save');
      expect(found!.getStatus().toString()).toBe('PUBLISHED');
      expect(found!.getTitle()).toBe('Test Event');
    });

    it('returns null for a non-existent ID', async () => {
      const result = await repo.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates status, date, and title', async () => {
      await repo.save(makeEvent({ id: 'ev-upd' }));

      const newDate = new Date('2026-01-01');
      const updated = await repo.update({
        eventId: EventId.fromString('ev-upd'),
        status: EventStatus.COMPLETED,
        date: newDate,
        title: 'Updated Title',
      });

      expect(updated.getStatus().toString()).toBe('COMPLETED');
      expect(updated.getTitle()).toBe('Updated Title');
      expect(updated.getDate()!.toISOString()).toBe(newDate.toISOString());
    });

    it('throws when the event does not exist', async () => {
      await expect(
        repo.update({
          eventId: EventId.fromString('ghost-ev'),
          status: EventStatus.CANCELLED,
        }),
      ).rejects.toThrow();
    });
  });

  // ─── updateStatus ────────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('changes only the status', async () => {
      await repo.save(makeEvent({ id: 'ev-status' }));

      const updated = await repo.updateStatus(
        EventId.fromString('ev-status'),
        EventStatus.CANCELLED,
      );
      expect(updated.getStatus().toString()).toBe('CANCELLED');
    });

    it('throws when the event does not exist', async () => {
      await expect(
        repo.updateStatus(EventId.fromString('ghost'), EventStatus.CANCELLED),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes an event; findById returns null afterwards', async () => {
      await repo.save(makeEvent({ id: 'ev-del' }));

      await repo.delete('ev-del');

      const found = await repo.findById('ev-del');
      expect(found).toBeNull();
    });
  });

  describe('deleteAll', () => {
    it('removes all events from the collection', async () => {
      await repo.save(makeEvent({ id: 'ev-a' }));
      await repo.save(makeEvent({ id: 'ev-b' }));

      await repo.deleteAll();

      expect(await repo.findById('ev-a')).toBeNull();
      expect(await repo.findById('ev-b')).toBeNull();
    });
  });
});
