import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { TicketRepositoryImpl } from 'src/tickets/infrastructure/persistence/repositories/ticket.repository';
import {
  TicketDocument,
  TicketSchema,
} from 'src/tickets/infrastructure/persistence/schemas/ticket.schema';
import {
  EventDocument,
  EventSchema,
} from 'src/tickets/infrastructure/persistence/schemas/event.schema';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';

describe('TicketRepositoryImpl (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repo: TicketRepositoryImpl;
  let eventModel: Model<EventDocument>;

  const makeTicket = (
    overrides: {
      userId?: string;
      eventId?: string;
      status?: TicketStatus;
    } = {},
  ): Ticket =>
    Ticket.create({
      eventId: EventId.fromString(overrides.eventId ?? 'ev-1'),
      userId: UserId.fromString(overrides.userId ?? 'user-1'),
      attendeeName: 'Test Attendee',
      ticketTypeId: EventTicketTypeId.fromString('type-1'),
      price: Money.fromAmount(10, 'USD'),
      status: overrides.status ?? TicketStatus.ACTIVE,
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: TicketDocument.name, schema: TicketSchema },
          { name: EventDocument.name, schema: EventSchema },
        ]),
      ],
      providers: [TicketRepositoryImpl],
    }).compile();

    repo = module.get(TicketRepositoryImpl);
    eventModel = module.get<Model<EventDocument>>(
      getModelToken(EventDocument.name),
    );
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await module
      .get<Model<TicketDocument>>(getModelToken(TicketDocument.name))
      .deleteMany({});
    await eventModel.deleteMany({});
  });

  describe('save + findById', () => {
    it('saves a ticket and retrieves it by ID', async () => {
      const ticket = makeTicket();
      await repo.save(ticket);

      const found = await repo.findById(ticket.getId().toString());
      expect(found).not.toBeNull();
      expect(found!.getId().toString()).toBe(ticket.getId().toString());
      expect(found!.getUserId().toString()).toBe('user-1');
      expect(found!.getEventId().toString()).toBe('ev-1');
      expect(found!.getStatus().toString()).toBe('ACTIVE');
    });

    it('returns null for a non-existent ID', async () => {
      const result = await repo.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns an empty result when user has no tickets', async () => {
      const result = await repo.findByUserId('user-nobody');
      expect(result.totalItems).toBe(0);
      expect(result.items).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it('excludes tickets belonging to other users', async () => {
      await repo.save(makeTicket({ userId: 'user-1' }));
      await repo.save(makeTicket({ userId: 'user-2' }));

      const result = await repo.findByUserId('user-1');
      expect(result.totalItems).toBe(1);
      expect(
        result.items.every((t) => t.getUserId().toString() === 'user-1'),
      ).toBe(true);
    });

    it('paginates correctly: 15 tickets, limit=5 offset=5 → 5 items, hasMore=true', async () => {
      for (let i = 0; i < 15; i++) {
        await repo.save(makeTicket({ userId: 'user-page' }));
      }

      const result = await repo.findByUserId('user-page', {
        limit: 5,
        offset: 5,
      });
      expect(result.totalItems).toBe(15);
      expect(result.items).toHaveLength(5);
      expect(result.hasMore).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(5);
    });

    it('last page has hasMore=false', async () => {
      for (let i = 0; i < 15; i++) {
        await repo.save(makeTicket({ userId: 'user-last' }));
      }

      const result = await repo.findByUserId('user-last', {
        limit: 5,
        offset: 10,
      });
      expect(result.items).toHaveLength(5);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('findByUserIdAndEventId', () => {
    it('returns all tickets for user + event when no status filter', async () => {
      await repo.save(
        makeTicket({
          userId: 'u1',
          eventId: 'ev-x',
          status: TicketStatus.ACTIVE,
        }),
      );
      await repo.save(
        makeTicket({
          userId: 'u1',
          eventId: 'ev-x',
          status: TicketStatus.CANCELLED,
        }),
      );
      await repo.save(makeTicket({ userId: 'u1', eventId: 'ev-y' }));

      const result = await repo.findByUserIdAndEventId('u1', 'ev-x');
      expect(result).toHaveLength(2);
    });

    it('filters by status when provided', async () => {
      await repo.save(
        makeTicket({
          userId: 'u2',
          eventId: 'ev-z',
          status: TicketStatus.ACTIVE,
        }),
      );
      await repo.save(
        makeTicket({
          userId: 'u2',
          eventId: 'ev-z',
          status: TicketStatus.CANCELLED,
        }),
      );

      const result = await repo.findByUserIdAndEventId(
        'u2',
        'ev-z',
        TicketStatus.ACTIVE,
      );
      expect(result).toHaveLength(1);
      expect(result[0].getStatus().toString()).toBe('ACTIVE');
    });

    it('returns empty array when no tickets match', async () => {
      const result = await repo.findByUserIdAndEventId('nobody', 'ev-none');
      expect(result).toHaveLength(0);
    });
  });

  describe('findEventsByUserId', () => {
    const seedEvents = async () => {
      await eventModel.create({
        _id: 'ev-1',
        creatorId: 'c',
        status: 'PUBLISHED',
        date: new Date('2025-01-01'),
      });
      await eventModel.create({
        _id: 'ev-2',
        creatorId: 'c',
        status: 'PUBLISHED',
        date: new Date('2025-06-01'),
      });
      await eventModel.create({
        _id: 'ev-3',
        creatorId: 'c',
        status: 'COMPLETED',
        date: new Date('2025-12-01'),
      });

      for (const evId of ['ev-1', 'ev-2', 'ev-3']) {
        await repo.save(makeTicket({ userId: 'user-ev', eventId: evId }));
      }
    };

    it('returns unique event IDs for the user', async () => {
      await seedEvents();
      await repo.save(makeTicket({ userId: 'user-ev', eventId: 'ev-1' }));

      const result = await repo.findEventsByUserId('user-ev');
      expect(result.totalItems).toBe(3);
      expect(result.items).toHaveLength(3);
    });

    it('filters events by status', async () => {
      await seedEvents();

      const result = await repo.findEventsByUserId(
        'user-ev',
        undefined,
        'PUBLISHED',
      );
      expect(result.totalItems).toBe(2);
      expect(result.items.map((e) => e.toString())).toEqual(
        expect.arrayContaining(['ev-1', 'ev-2']),
      );
    });

    it('returns events sorted by date asc', async () => {
      await seedEvents();

      const result = await repo.findEventsByUserId(
        'user-ev',
        undefined,
        undefined,
        'asc',
      );
      expect(result.items.map((e) => e.toString())).toEqual([
        'ev-1',
        'ev-2',
        'ev-3',
      ]);
    });

    it('returns events sorted by date desc', async () => {
      await seedEvents();

      const result = await repo.findEventsByUserId(
        'user-ev',
        undefined,
        undefined,
        'desc',
      );
      expect(result.items.map((e) => e.toString())).toEqual([
        'ev-3',
        'ev-2',
        'ev-1',
      ]);
    });

    it('paginates event results', async () => {
      await seedEvents();

      const result = await repo.findEventsByUserId('user-ev', {
        limit: 2,
        offset: 0,
      });
      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('returns empty result for user with no tickets', async () => {
      await seedEvents();

      const result = await repo.findEventsByUserId('user-nobody');
      expect(result.totalItems).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('updates and returns the modified ticket', async () => {
      const ticket = makeTicket();
      await repo.save(ticket);
      ticket.cancel();

      const updated = await repo.update(ticket);
      expect(updated.getStatus().toString()).toBe('CANCELLED');

      const fromDb = await repo.findById(ticket.getId().toString());
      expect(fromDb!.getStatus().toString()).toBe('CANCELLED');
    });

    it('throws when updating a non-existent ticket', async () => {
      const ghost = makeTicket();
      await expect(repo.update(ghost)).rejects.toThrow();
    });
  });

  describe('findByEventId', () => {
    it('returns paginated tickets for the event', async () => {
      for (let i = 0; i < 5; i++) {
        await repo.save(makeTicket({ eventId: 'ev-paged' }));
      }
      await repo.save(makeTicket({ eventId: 'ev-other' }));

      const result = await repo.findByEventId('ev-paged', {
        limit: 3,
        offset: 0,
      });
      expect(result.totalItems).toBe(5);
      expect(result.items).toHaveLength(3);
      expect(result.hasMore).toBe(true);
      expect(
        result.items.every((t) => t.getEventId().toString() === 'ev-paged'),
      ).toBe(true);
    });

    it('returns empty result when event has no tickets', async () => {
      const result = await repo.findByEventId('ev-empty');
      expect(result.totalItems).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  describe('findByTicketTypeId', () => {
    it('returns all tickets for a given ticket type', async () => {
      const t1 = Ticket.create({
        eventId: EventId.fromString('ev-1'),
        userId: UserId.fromString('u1'),
        attendeeName: 'Alice',
        ticketTypeId: EventTicketTypeId.fromString('type-vip'),
        price: Money.fromAmount(50, 'USD'),
      });
      const t2 = Ticket.create({
        eventId: EventId.fromString('ev-1'),
        userId: UserId.fromString('u2'),
        attendeeName: 'Bob',
        ticketTypeId: EventTicketTypeId.fromString('type-vip'),
        price: Money.fromAmount(50, 'USD'),
      });
      const t3 = makeTicket();
      await repo.save(t1);
      await repo.save(t2);
      await repo.save(t3);

      const result = await repo.findByTicketTypeId('type-vip');
      expect(result).toHaveLength(2);
      expect(
        result.every((t) => t.getTicketTypeId().toString() === 'type-vip'),
      ).toBe(true);
    });

    it('returns empty array when no tickets match', async () => {
      const result = await repo.findByTicketTypeId('type-none');
      expect(result).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('deletes a ticket; findById returns null afterwards', async () => {
      const ticket = makeTicket();
      await repo.save(ticket);

      await repo.delete(ticket.getId().toString());

      const found = await repo.findById(ticket.getId().toString());
      expect(found).toBeNull();
    });
  });

  describe('deleteAll', () => {
    it('removes all tickets from the collection', async () => {
      await repo.save(makeTicket());
      await repo.save(makeTicket());

      await repo.deleteAll();

      const result = await repo.findByUserId('user-1');
      expect(result.totalItems).toBe(0);
    });
  });
});
