import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { EventEventConsumer } from 'src/tickets/presentation/consumers/event-event.consumer';
import { EventDocument } from 'src/tickets/infrastructure/persistence/schemas/event.schema';
import type { RmqContext } from '@nestjs/microservices';
import { AppModule } from 'src/app.module';

interface MockChannel {
  ack: jest.Mock;
  nack: jest.Mock;
}

interface MockRmqContext extends RmqContext {
  getChannelRef: () => MockChannel;
}

describe('EventEventConsumer (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let consumer: EventEventConsumer;
  let eventModel: Model<EventDocument>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PAYMENT_SERVICE)
      .useValue({
        createCheckoutSession: jest.fn(),
        handleWebhookEvent: jest.fn(),
      })
      .overrideProvider(EventPublisher)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        publish: jest.fn(),
      })
      .overrideProvider(OutboxRelayService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    consumer = moduleFixture.get<EventEventConsumer>(EventEventConsumer);
    eventModel = moduleFixture.get<Model<EventDocument>>(
      getModelToken(EventDocument.name),
    );
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await eventModel.deleteMany({});
  });

  // ─── helpers ────────────────────────────────────────────────────────────────

  const createMockRmqContext = (routingKey: string): MockRmqContext => {
    const mockChannel: MockChannel = { ack: jest.fn(), nack: jest.fn() };
    const mockMessage = {
      fields: { routingKey },
      content: Buffer.from('{}'),
      properties: {},
    };
    return {
      getMessage: () => mockMessage,
      getChannelRef: () => mockChannel,
      getPattern: () => routingKey,
      getArgs: () => [mockMessage, mockChannel],
    } as unknown as MockRmqContext;
  };

  const seedEvent = (id: string, status = 'DRAFT') =>
    eventModel.create({ _id: id, creatorId: 'creator-1', status });

  const envelope = <T>(payload: T) => ({
    eventType: 'test',
    occurredAt: new Date(),
    payload,
  });

  // ─── event.updated ──────────────────────────────────────────────────────────

  describe('event.updated', () => {
    it('updates title, date and status in the DB and acks', async () => {
      await seedEvent('ev-1', 'DRAFT');
      const ctx = createMockRmqContext('event.updated');

      await consumer.handleAllEvents(
        envelope({
          eventId: 'ev-1',
          name: 'Festival 2025',
          status: 'PUBLISHED',
          date: new Date('2025-06-01'),
        }),
        ctx,
      );

      expect(ctx.getChannelRef().ack).toHaveBeenCalled();
      const doc = await eventModel.findById('ev-1');
      expect(doc?.title).toBe('Festival 2025');
      expect(doc?.status).toBe('PUBLISHED');
    });

    it('nacks when event does not exist', async () => {
      const ctx = createMockRmqContext('event.updated');

      await consumer.handleAllEvents(
        envelope({ eventId: 'ghost', status: 'PUBLISHED' }),
        ctx,
      );

      expect(ctx.getChannelRef().nack).toHaveBeenCalledWith(
        expect.anything(),
        false,
        false,
      );
      expect(ctx.getChannelRef().ack).not.toHaveBeenCalled();
    });

    it('nacks on invalid status value', async () => {
      await seedEvent('ev-bad', 'DRAFT');
      const ctx = createMockRmqContext('event.updated');

      await consumer.handleAllEvents(
        envelope({ eventId: 'ev-bad', status: 'INVALID_STATUS' }),
        ctx,
      );

      expect(ctx.getChannelRef().nack).toHaveBeenCalledWith(
        expect.anything(),
        false,
        false,
      );
    });
  });

  // ─── event.published ────────────────────────────────────────────────────────

  describe('event.published', () => {
    it('sets status to PUBLISHED and acks', async () => {
      await seedEvent('ev-2', 'DRAFT');
      const ctx = createMockRmqContext('event.published');

      await consumer.handleAllEvents(envelope({ eventId: 'ev-2' }), ctx);

      expect(ctx.getChannelRef().ack).toHaveBeenCalled();
      const doc = await eventModel.findById('ev-2');
      expect(doc?.status).toBe('PUBLISHED');
    });

    it('nacks when event does not exist', async () => {
      const ctx = createMockRmqContext('event.published');

      await consumer.handleAllEvents(envelope({ eventId: 'ghost' }), ctx);

      expect(ctx.getChannelRef().nack).toHaveBeenCalledWith(
        expect.anything(),
        false,
        false,
      );
    });
  });

  // ─── event.completed ────────────────────────────────────────────────────────

  describe('event.completed', () => {
    it('sets status to COMPLETED and acks', async () => {
      await seedEvent('ev-3', 'PUBLISHED');
      const ctx = createMockRmqContext('event.completed');

      await consumer.handleAllEvents(envelope({ eventId: 'ev-3' }), ctx);

      expect(ctx.getChannelRef().ack).toHaveBeenCalled();
      const doc = await eventModel.findById('ev-3');
      expect(doc?.status).toBe('COMPLETED');
    });

    it('nacks when event does not exist', async () => {
      const ctx = createMockRmqContext('event.completed');

      await consumer.handleAllEvents(envelope({ eventId: 'ghost' }), ctx);

      expect(ctx.getChannelRef().nack).toHaveBeenCalledWith(
        expect.anything(),
        false,
        false,
      );
    });
  });

  // ─── event.cancelled ────────────────────────────────────────────────────────

  describe('event.cancelled', () => {
    it('sets status to CANCELLED and acks', async () => {
      await seedEvent('ev-4', 'PUBLISHED');
      const ctx = createMockRmqContext('event.cancelled');

      await consumer.handleAllEvents(envelope({ eventId: 'ev-4' }), ctx);

      expect(ctx.getChannelRef().ack).toHaveBeenCalled();
      const doc = await eventModel.findById('ev-4');
      expect(doc?.status).toBe('CANCELLED');
    });

    it('nacks when event does not exist', async () => {
      const ctx = createMockRmqContext('event.cancelled');

      await consumer.handleAllEvents(envelope({ eventId: 'ghost' }), ctx);

      expect(ctx.getChannelRef().nack).toHaveBeenCalledWith(
        expect.anything(),
        false,
        false,
      );
    });
  });

  // ─── event.deleted ──────────────────────────────────────────────────────────

  describe('event.deleted', () => {
    it('deletes the event atomically and acks', async () => {
      await seedEvent('ev-5', 'CANCELLED');
      const ctx = createMockRmqContext('event.deleted');

      await consumer.handleAllEvents(envelope({ eventId: 'ev-5' }), ctx);

      expect(ctx.getChannelRef().ack).toHaveBeenCalled();
      expect(await eventModel.findById('ev-5')).toBeNull();
    });

    it('acks even when event does not exist (delete is idempotent)', async () => {
      const ctx = createMockRmqContext('event.deleted');

      await consumer.handleAllEvents(envelope({ eventId: 'ghost' }), ctx);

      expect(ctx.getChannelRef().ack).toHaveBeenCalled();
    });
  });

  // ─── unknown routing key ────────────────────────────────────────────────────

  it('acks on unknown routing key', async () => {
    const ctx = createMockRmqContext('unknown.event');

    await consumer.handleAllEvents(envelope({}), ctx);

    expect(ctx.getChannelRef().ack).toHaveBeenCalled();
    expect(ctx.getChannelRef().nack).not.toHaveBeenCalled();
  });
});
