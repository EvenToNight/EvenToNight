import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { UserEventConsumer } from 'src/tickets/presentation/consumers/user-event.consumer';
import { UserDocument } from 'src/tickets/infrastructure/persistence/schemas/user.schema';
import type { RmqContext } from '@nestjs/microservices';
import { AppModule } from 'src/app.module';

interface MockChannel {
  ack: jest.Mock;
  nack: jest.Mock;
}

interface MockRmqContext extends RmqContext {
  getChannelRef: () => MockChannel;
}

describe('UserEventConsumer (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryReplSet;
  let userEventConsumer: UserEventConsumer;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    process.env.NODE_ENV = 'test';

    mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const mongoUri = mongod.getUri();
    process.env.MONGO_URI = mongoUri;

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

    userEventConsumer = moduleFixture.get<UserEventConsumer>(UserEventConsumer);
    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(UserDocument.name),
    );
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  const createMockRmqContext = (
    routingKey: string,
    messageId?: string,
  ): MockRmqContext => {
    const mockChannel: MockChannel = {
      ack: jest.fn(),
      nack: jest.fn(),
    };

    const mockMessage = {
      fields: { routingKey },
      content: Buffer.from('{}'),
      properties: messageId ? { messageId } : {},
    };

    return {
      getMessage: () => mockMessage,
      getChannelRef: () => mockChannel,
      getPattern: () => routingKey,
      getArgs: () => [mockMessage, mockChannel],
    } as unknown as MockRmqContext;
  };

  it('should create a user when receiving user.created event', async () => {
    const envelope = {
      eventType: 'user.created',
      occurredAt: new Date(),
      payload: {
        id: 'user-123',
        language: 'it',
      },
    };

    const context = createMockRmqContext('user.created');

    await userEventConsumer.handleAllEvents(envelope, context);

    const mockChannel = context.getChannelRef();
    expect(mockChannel.ack).toHaveBeenCalled();

    const user = await userModel.findOne({ _id: 'user-123' });
    expect(user).toBeDefined();
    expect(user?.language).toBe('it');
  });

  it('should update a user when receiving user.updated event', async () => {
    await userModel.create({ _id: 'user-456', language: 'en' });

    const envelope = {
      eventType: 'user.updated',
      occurredAt: new Date(),
      payload: {
        id: 'user-456',
        language: 'it',
      },
    };

    const context = createMockRmqContext('user.updated');

    await userEventConsumer.handleAllEvents(envelope, context);

    const mockChannel = context.getChannelRef();
    expect(mockChannel.ack).toHaveBeenCalled();

    const user = await userModel.findOne({ _id: 'user-456' });
    expect(user).toBeDefined();
    expect(user?.language).toBe('it');
  });

  it('should delete a user when receiving user.deleted event', async () => {
    await userModel.create({ _id: 'user-789', language: 'en' });

    const envelope = {
      eventType: 'user.deleted',
      occurredAt: new Date(),
      payload: {
        id: 'user-789',
      },
    };

    const context = createMockRmqContext('user.deleted');

    await userEventConsumer.handleAllEvents(envelope, context);

    const mockChannel = context.getChannelRef();
    expect(mockChannel.ack).toHaveBeenCalled();

    const user = await userModel.findOne({ _id: 'user-789' });
    expect(user).toBeNull();
  });

  it('should warn on unknown routing key', async () => {
    const envelope = {
      eventType: 'unknown.event',
      occurredAt: new Date(),
      payload: {},
    };

    const context = createMockRmqContext('unknown.event');

    await userEventConsumer.handleAllEvents(envelope, context);

    const mockChannel = context.getChannelRef();
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should skip duplicate messages with the same messageId', async () => {
    const msgId = 'user-msg-001';
    const envelope = {
      eventType: 'user.created',
      occurredAt: new Date(),
      payload: { id: 'user-dup', language: 'it' },
    };

    const ctx1 = createMockRmqContext('user.created', msgId);
    await userEventConsumer.handleAllEvents(envelope, ctx1);
    expect(ctx1.getChannelRef().ack).toHaveBeenCalled();
    expect(await userModel.findOne({ _id: 'user-dup' })).toBeDefined();

    // Delete user to verify second call does not re-create
    await userModel.deleteOne({ _id: 'user-dup' });

    const ctx2 = createMockRmqContext('user.created', msgId);
    await userEventConsumer.handleAllEvents(envelope, ctx2);
    expect(ctx2.getChannelRef().ack).toHaveBeenCalled();

    // User should not have been re-created — duplicate was skipped
    expect(await userModel.findOne({ _id: 'user-dup' })).toBeNull();
  });
});
