import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher } from 'src/commons/intrastructure/messaging/event-publisher';
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
  let mongod: MongoMemoryServer;
  let userEventConsumer: UserEventConsumer;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MongooseModule)
      .useModule(
        MongooseModule.forRoot(mongoUri, {
          dbName: 'test',
        }),
      )
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

  const createMockRmqContext = (routingKey: string): MockRmqContext => {
    const mockChannel: MockChannel = {
      ack: jest.fn(),
      nack: jest.fn(),
    };

    const mockMessage = {
      fields: {
        routingKey,
      },
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
});
