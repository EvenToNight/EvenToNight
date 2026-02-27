process.env.NODE_ENV = 'development';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { AppModule } from 'src/app.module';
import { EventDispatcher } from 'src/tickets/presentation/consumers/event.dispatcher';
import { UserEventConsumer } from 'src/tickets/presentation/consumers/user-event.consumer';
import { EventEventConsumer } from 'src/tickets/presentation/consumers/event-event.consumer';
import type { RmqContext } from '@nestjs/microservices';

interface MockChannel {
  ack: jest.Mock;
  nack: jest.Mock;
}

interface MockRmqContext extends RmqContext {
  getChannelRef: () => MockChannel;
}

describe('EventDispatcher (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let dispatcher: EventDispatcher;
  let userEventConsumer: UserEventConsumer;
  let eventEventConsumer: EventEventConsumer;

  beforeAll(async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

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
    app.useLogger(false);
    await app.init();

    dispatcher = moduleFixture.get<EventDispatcher>(EventDispatcher);
    userEventConsumer = moduleFixture.get<UserEventConsumer>(UserEventConsumer);
    eventEventConsumer =
      moduleFixture.get<EventEventConsumer>(EventEventConsumer);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

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

  const envelope = <T>(payload: T) => ({
    eventType: 'test',
    occurredAt: new Date(),
    payload,
  });

  // ─── user.* routing ───────────────────────────────────────────────────────

  it('routes user.* messages to UserEventConsumer', async () => {
    const spy = jest
      .spyOn(userEventConsumer, 'handleAllEvents')
      .mockResolvedValueOnce(undefined);

    const ctx = createMockRmqContext('user.created');
    await dispatcher.handleAllEvents(envelope({}), ctx);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  // ─── event.* routing ──────────────────────────────────────────────────────

  it('routes event.* messages to EventEventConsumer', async () => {
    const spy = jest
      .spyOn(eventEventConsumer, 'handleAllEvents')
      .mockResolvedValueOnce(undefined);

    const ctx = createMockRmqContext('event.updated');
    await dispatcher.handleAllEvents(envelope({}), ctx);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  // ─── unknown routing key ──────────────────────────────────────────────────

  it('acks on unknown routing key', async () => {
    const ctx = createMockRmqContext('unknown.routing.key');
    await dispatcher.handleAllEvents(envelope({}), ctx);

    expect(ctx.getChannelRef().ack).toHaveBeenCalled();
    expect(ctx.getChannelRef().nack).not.toHaveBeenCalled();
  });

  // ─── catch block: Error thrown ────────────────────────────────────────────

  it('nacks when the consumer throws an Error', async () => {
    const spy = jest
      .spyOn(userEventConsumer, 'handleAllEvents')
      .mockRejectedValueOnce(new Error('consumer exploded'));

    const ctx = createMockRmqContext('user.created');
    await dispatcher.handleAllEvents(envelope({}), ctx);

    expect(ctx.getChannelRef().nack).toHaveBeenCalledWith(
      expect.anything(),
      false,
      false,
    );
    spy.mockRestore();
  });

  // ─── catch block: non-Error thrown (covers logger branch) ────────────────

  it('nacks even when a non-Error value is thrown', async () => {
    const spy = jest
      .spyOn(eventEventConsumer, 'handleAllEvents')
      .mockRejectedValueOnce('plain-string-not-an-error');

    const ctx = createMockRmqContext('event.published');
    await dispatcher.handleAllEvents(envelope({}), ctx);

    expect(ctx.getChannelRef().nack).toHaveBeenCalledWith(
      expect.anything(),
      false,
      false,
    );
    spy.mockRestore();
  });
});
