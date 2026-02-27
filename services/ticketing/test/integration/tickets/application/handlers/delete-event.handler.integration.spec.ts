import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { AppModule } from 'src/app.module';
import { DeleteEventHandler } from 'src/tickets/application/handlers/delete-event.handler';
import { EventService } from 'src/tickets/application/services/event.service';
import { EventDocument } from 'src/tickets/infrastructure/persistence/schemas/event.schema';
import { EventTicketTypeDocument } from 'src/tickets/infrastructure/persistence/schemas/event-ticket-type.schema';
import { MongoTransactionManager, TRANSACTION_MANAGER } from '@libs/ts-common';

describe('DeleteEventHandler - transaction atomicity', () => {
  let app: INestApplication;
  let replSet: MongoMemoryReplSet;
  let handler: DeleteEventHandler;
  let eventService: EventService;
  let txManager: MongoTransactionManager;
  let eventModel: Model<EventDocument>;
  let eventTicketTypeModel: Model<EventTicketTypeDocument>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    process.env.MONGO_URI = replSet.getUri();
    process.env.MONGO_HOST = 'localhost';

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

    handler = moduleFixture.get<DeleteEventHandler>(DeleteEventHandler);
    eventService = moduleFixture.get<EventService>(EventService);
    txManager = moduleFixture.get<MongoTransactionManager>(TRANSACTION_MANAGER);
    eventModel = moduleFixture.get<Model<EventDocument>>(
      getModelToken(EventDocument.name),
    );
    eventTicketTypeModel = moduleFixture.get<Model<EventTicketTypeDocument>>(
      getModelToken(EventTicketTypeDocument.name),
    );
  });

  afterAll(async () => {
    delete process.env.MONGO_HOST;
    await app.close();
    await replSet.stop();
  });

  beforeEach(async () => {
    await eventModel.deleteMany({});
    await eventTicketTypeModel.deleteMany({});
    jest.restoreAllMocks();
  });

  const seedEvent = (id: string) =>
    eventModel.create({ _id: id, creatorId: 'creator-1', status: 'CANCELLED' });

  const seedTicketType = (id: string, eventId: string, type = 'STANDARD') =>
    eventTicketTypeModel.create({
      _id: id,
      eventId,
      type,
      price: { amount: 10, currency: 'EUR' },
      availableQuantity: 100,
      soldQuantity: 0,
    });

  it('rolls back ticket type deletions when event deletion fails', async () => {
    await seedEvent('ev-atomic');
    await seedTicketType('tt-1', 'ev-atomic', 'STANDARD');
    await seedTicketType('tt-2', 'ev-atomic', 'VIP');

    jest
      .spyOn(eventService, 'delete')
      .mockRejectedValue(new Error('DB failure'));

    jest.spyOn(txManager['logger'], 'warn').mockImplementation(() => undefined);
    jest
      .spyOn(txManager['logger'], 'error')
      .mockImplementation(() => undefined);

    await expect(handler.handle('ev-atomic')).rejects.toThrow('DB failure');

    expect(await eventTicketTypeModel.findById('tt-1')).not.toBeNull();
    expect(await eventTicketTypeModel.findById('tt-2')).not.toBeNull();
    expect(await eventModel.findById('ev-atomic')).not.toBeNull();
  });

  it('deletes ticket types and event atomically on success', async () => {
    await seedEvent('ev-ok');
    await seedTicketType('tt-3', 'ev-ok');

    await handler.handle('ev-ok');

    expect(await eventTicketTypeModel.findById('tt-3')).toBeNull();
    expect(await eventModel.findById('ev-ok')).toBeNull();
  });

  it('succeeds with no ticket types (event-only deletion)', async () => {
    await seedEvent('ev-no-types');

    await handler.handle('ev-no-types');

    expect(await eventModel.findById('ev-no-types')).toBeNull();
  });
});
