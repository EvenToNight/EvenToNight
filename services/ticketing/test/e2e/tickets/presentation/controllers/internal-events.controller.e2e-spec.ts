process.env.NODE_ENV = 'development';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventService } from 'src/tickets/application/services/event.service';
import { CreateEventHandler } from 'src/tickets/application/handlers/create-event.handler';

describe('InternalEventsController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let eventService: EventService;
  let createEventHandler: CreateEventHandler;

  const validBody = {
    creatorId: 'creator-1',
    status: 'DRAFT',
  };

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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    eventService = moduleFixture.get<EventService>(EventService);
    createEventHandler =
      moduleFixture.get<CreateEventHandler>(CreateEventHandler);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await eventService.deleteAll();
  });

  describe('POST /internal/events/:eventId', () => {
    describe('Given a new eventId and valid body', () => {
      it('Then returns 201 and creates the event', async () => {
        await request(app.getHttpServer())
          .post('/internal/events/event-new')
          .send(validBody)
          .expect(201);

        const event = await eventService.findById('event-new');
        expect(event).not.toBeNull();
        expect(event?.getStatus().toString()).toBe('DRAFT');
      });
    });

    describe('Given an already existing eventId (EventAlreadyExistsException)', () => {
      it('Then returns 201 (exception is silenced)', async () => {
        // Create the event first
        await request(app.getHttpServer())
          .post('/internal/events/event-dup')
          .send(validBody)
          .expect(201);

        // Try to create again — should be silenced
        await request(app.getHttpServer())
          .post('/internal/events/event-dup')
          .send(validBody)
          .expect(201);
      });
    });

    describe('Given a generic error from the handler', () => {
      it('Then returns 500 InternalServerError', async () => {
        const spy = jest
          .spyOn(createEventHandler, 'handle')
          .mockRejectedValueOnce(new Error('Unexpected DB failure'));

        await request(app.getHttpServer())
          .post('/internal/events/event-err')
          .send(validBody)
          .expect(500);

        spy.mockRestore();
      });
    });

    describe('Given invalid body (missing creatorId)', () => {
      it('Then returns 400 Bad Request', async () => {
        await request(app.getHttpServer())
          .post('/internal/events/event-bad')
          .send({ status: 'DRAFT' })
          .expect(400);
      });
    });

    describe('Given a DRAFT event with a date provided', () => {
      it('Then returns 201 (ValidateIf condition: status=DRAFT, date defined)', async () => {
        await request(app.getHttpServer())
          .post('/internal/events/event-draft-with-date')
          .send({
            creatorId: 'creator-1',
            status: 'DRAFT',
            date: new Date('2025-12-01').toISOString(),
          })
          .expect(201);
      });
    });
  });
});
