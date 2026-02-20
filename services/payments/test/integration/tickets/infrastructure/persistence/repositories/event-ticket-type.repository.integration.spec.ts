import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { EventTicketTypeRepositoryImpl } from 'src/tickets/infrastructure/persistence/repositories/event-ticket-type.repository';
import {
  EventTicketTypeDocument,
  EventTicketTypeSchema,
} from 'src/tickets/infrastructure/persistence/schemas/event-ticket-type.schema';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

describe('EventTicketTypeRepositoryImpl (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repo: EventTicketTypeRepositoryImpl;
  let model: Model<EventTicketTypeDocument>;

  const makeTicketType = (
    overrides: {
      id?: string;
      eventId?: string;
      type?: string;
      availableQuantity?: number;
      price?: number;
    } = {},
  ): EventTicketType =>
    EventTicketType.create({
      id: EventTicketTypeId.fromString(overrides.id ?? 'ett-1'),
      eventId: EventId.fromString(overrides.eventId ?? 'ev-1'),
      type: TicketType.fromString(overrides.type ?? 'STANDARD'),
      description: 'A test ticket type',
      price: Money.fromAmount(overrides.price ?? 50, 'USD'),
      availableQuantity: overrides.availableQuantity ?? 100,
      soldQuantity: 0,
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: EventTicketTypeDocument.name, schema: EventTicketTypeSchema },
        ]),
      ],
      providers: [EventTicketTypeRepositoryImpl],
    }).compile();

    repo = module.get(EventTicketTypeRepositoryImpl);
    model = module.get<Model<EventTicketTypeDocument>>(
      getModelToken(EventTicketTypeDocument.name),
    );
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await model.deleteMany({});
  });

  describe('save + findById', () => {
    it('saves a ticket type and retrieves it by ID', async () => {
      const tt = makeTicketType({ id: 'ett-save', eventId: 'ev-1' });
      await repo.save(tt);

      const found = await repo.findById('ett-save');
      expect(found).not.toBeNull();
      expect(found!.getId().toString()).toBe('ett-save');
      expect(found!.getEventId().toString()).toBe('ev-1');
      expect(found!.getType().toString()).toBe('STANDARD');
      expect(found!.getAvailableQuantity()).toBe(100);
    });

    it('returns null for a non-existent ID', async () => {
      expect(await repo.findById('non-existent')).toBeNull();
    });
  });

  describe('findByEventId', () => {
    it('returns all ticket types for an event', async () => {
      await repo.save(
        makeTicketType({ id: 'ett-std', eventId: 'ev-x', type: 'STANDARD' }),
      );
      await repo.save(
        makeTicketType({ id: 'ett-vip', eventId: 'ev-x', type: 'VIP' }),
      );
      await repo.save(
        makeTicketType({ id: 'ett-other', eventId: 'ev-y', type: 'STANDARD' }),
      );

      const result = await repo.findByEventId('ev-x');
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.getEventId().toString() === 'ev-x')).toBe(
        true,
      );
    });

    it('returns empty array when event has no ticket types', async () => {
      const result = await repo.findByEventId('ev-empty');
      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('updates and returns the modified ticket type', async () => {
      const tt = makeTicketType({ id: 'ett-upd', availableQuantity: 50 });
      await repo.save(tt);
      tt.reserveTicket();

      const updated = await repo.update(tt);
      expect(updated.getAvailableQuantity()).toBe(49);
      expect(updated.getSoldQuantity()).toBe(1);

      const fromDb = await repo.findById('ett-upd');
      expect(fromDb!.getAvailableQuantity()).toBe(49);
    });

    it('throws when updating a non-existent ticket type', async () => {
      const ghost = makeTicketType({ id: 'ghost-ett' });
      await expect(repo.update(ghost)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes a ticket type; findById returns null afterwards', async () => {
      const tt = makeTicketType({ id: 'ett-del' });
      await repo.save(tt);

      await repo.delete('ett-del');

      expect(await repo.findById('ett-del')).toBeNull();
    });
  });

  describe('deleteAll', () => {
    it('removes all ticket types from the collection', async () => {
      await repo.save(
        makeTicketType({ id: 'ett-a', eventId: 'ev-1', type: 'STANDARD' }),
      );
      await repo.save(
        makeTicketType({ id: 'ett-b', eventId: 'ev-1', type: 'VIP' }),
      );

      await repo.deleteAll();

      expect(await repo.findById('ett-a')).toBeNull();
      expect(await repo.findById('ett-b')).toBeNull();
    });
  });

  describe('findEventIds', () => {
    it('returns unique event IDs across all ticket types', async () => {
      await repo.save(
        makeTicketType({ id: 'ett-1', eventId: 'ev-1', type: 'STANDARD' }),
      );
      await repo.save(
        makeTicketType({ id: 'ett-2', eventId: 'ev-2', type: 'STANDARD' }),
      );
      await repo.save(
        makeTicketType({ id: 'ett-3', eventId: 'ev-1', type: 'VIP' }),
      );

      const result = await repo.findEventIds({ currency: 'USD' });
      expect(result.totalItems).toBe(2);
      expect(result.items.map((e) => e.toString())).toEqual(
        expect.arrayContaining(['ev-1', 'ev-2']),
      );
    });

    it('filters by min price', async () => {
      await repo.save(
        makeTicketType({
          id: 'ett-cheap',
          eventId: 'ev-cheap',
          type: 'STANDARD',
          price: 10,
        }),
      );
      await repo.save(
        makeTicketType({
          id: 'ett-exp',
          eventId: 'ev-exp',
          type: 'STANDARD',
          price: 200,
        }),
      );

      const result = await repo.findEventIds({
        currency: 'USD',
        minPrice: 100,
      });
      expect(result.items.map((e) => e.toString())).toEqual(['ev-exp']);
    });

    it('filters by max price', async () => {
      await repo.save(
        makeTicketType({
          id: 'ett-cheap2',
          eventId: 'ev-cheap2',
          type: 'STANDARD',
          price: 10,
        }),
      );
      await repo.save(
        makeTicketType({
          id: 'ett-exp2',
          eventId: 'ev-exp2',
          type: 'STANDARD',
          price: 200,
        }),
      );

      const result = await repo.findEventIds({ currency: 'USD', maxPrice: 50 });
      expect(result.items.map((e) => e.toString())).toEqual(['ev-cheap2']);
    });

    it('reports hasMore correctly based on pagination params', async () => {
      await repo.save(
        makeTicketType({ id: 'ep-1', eventId: 'ev-p1', type: 'STANDARD' }),
      );
      await repo.save(
        makeTicketType({ id: 'ep-2', eventId: 'ev-p2', type: 'STANDARD' }),
      );
      await repo.save(
        makeTicketType({ id: 'ep-3', eventId: 'ev-p3', type: 'STANDARD' }),
      );

      const result = await repo.findEventIds({
        currency: 'USD',
        pagination: { limit: 2, offset: 0 },
      });
      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('returns empty result when collection is empty', async () => {
      const result = await repo.findEventIds({ currency: 'USD' });
      expect(result.totalItems).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('defaults to USD when no currency is specified', async () => {
      await repo.save(
        makeTicketType({
          id: 'ett-default',
          eventId: 'ev-default',
          type: 'STANDARD',
          price: 50,
        }),
      );

      const result = await repo.findEventIds();
      expect(result.totalItems).toBe(1);
    });
  });
});
