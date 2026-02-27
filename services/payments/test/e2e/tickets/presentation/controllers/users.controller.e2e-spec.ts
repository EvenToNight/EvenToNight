process.env.NODE_ENV = 'development';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import { PaginatedResponseDto } from '@libs/nestjs-common';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { TicketDocument } from 'src/tickets/infrastructure/persistence/schemas/ticket.schema';
import { UserDocument } from 'src/tickets/infrastructure/persistence/schemas/user.schema';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { EventService } from 'src/tickets/application/services/event.service';
import { DomainExceptionFilter } from 'src/tickets/presentation/filters/domain-exception.filter';
import { generateFakeToken, ONE_HOUR } from '@libs/ts-common';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let ticketService: TicketService;
  let eventService: EventService;
  let userModel: Model<UserDocument>;

  const userId = 'test-user-id';
  const anotherUserId = 'another-user-id';
  const eventId = 'test-event-id';

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
    app.useGlobalFilters(new DomainExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    ticketService = moduleFixture.get<TicketService>(TicketService);
    eventService = moduleFixture.get<EventService>(EventService);
    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(UserDocument.name),
    );
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await ticketService.deleteAll();
    await eventService.deleteAll();
    await userModel.deleteMany({});
  });

  // ─── GET /users/:userId/tickets ───────────────────────────────────────────

  describe('/users/:userId/tickets (GET)', () => {
    describe('Given a user who has not bought any tickets', () => {
      describe("When requesting it's own user tickets list", () => {
        it('Then returns an empty paginated response', async () => {
          const res = await request(app.getHttpServer())
            .get(`/users/${userId}/tickets`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
            )
            .expect(200);

          const body = res.body as PaginatedResponseDto<Ticket>;
          expect(body).toEqual(
            expect.objectContaining({
              items: [],
              totalItems: 0,
              hasMore: false,
            }),
          );
        });
      });

      describe("When requesting another user's tickets list", () => {
        it('Then returns 403 Forbidden', async () => {
          await request(app.getHttpServer())
            .get(`/users/${anotherUserId}/tickets`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
            )
            .expect(403);
        });
      });

      describe("When requesting user's without auth header", () => {
        it('Then returns 401 Unauthorized', async () => {
          await request(app.getHttpServer())
            .get(`/users/${userId}/tickets`)
            .expect(401);
        });
      });
    });

    describe('Given a user who has bought tickets', () => {
      beforeEach(async () => {
        for (let i = 1; i <= 15; i++) {
          await ticketService.create({
            eventId: EventId.fromString(`event-${i}`),
            userId: UserId.fromString(userId),
            attendeeName: `Attendee ${i}`,
            ticketTypeId: EventTicketTypeId.fromString(`type-${i}`),
            price: Money.fromAmount(i, 'USD'),
          });
        }
      });

      describe("When requesting it's own user tickets list", () => {
        it('Then returns a paginated response with the tickets', async () => {
          const limit = 5;
          const offset = 5;
          const res = await request(app.getHttpServer())
            .get(`/users/${userId}/tickets`)
            .query({ limit, offset })
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
            )
            .expect(200);

          const body = res.body as PaginatedResponseDto<TicketDocument>;
          expect(body).toEqual(
            expect.objectContaining({
              totalItems: 15,
              limit,
              offset,
              hasMore: true,
            }),
          );
          expect(body.items).toHaveLength(5);
        });
      });

      describe('When filtering by eventId', () => {
        it('Then returns only tickets for the specified event', async () => {
          const res = await request(app.getHttpServer())
            .get(`/users/${userId}/tickets`)
            .query({ eventId: 'event-1' })
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
            )
            .expect(200);

          const body = res.body as PaginatedResponseDto<TicketDocument>;
          expect(body.totalItems).toBe(1);
          expect(body.items).toHaveLength(1);
        });
      });
    });
  });

  // ─── GET /users/:userId/events ────────────────────────────────────────────

  describe('/users/:userId/events (GET)', () => {
    describe('Given a user with tickets across multiple events', () => {
      beforeEach(async () => {
        const eventDate1 = new Date('2025-01-01');
        const eventDate2 = new Date('2025-06-01');
        const eventDate3 = new Date('2025-12-01');

        await eventService.createOrUpdate(
          'ev-1',
          'creator',
          'PUBLISHED',
          eventDate1,
        );
        await eventService.createOrUpdate(
          'ev-2',
          'creator',
          'PUBLISHED',
          eventDate2,
        );
        await eventService.createOrUpdate(
          'ev-3',
          'creator',
          'COMPLETED',
          eventDate3,
        );

        for (const evId of ['ev-1', 'ev-2', 'ev-3']) {
          await ticketService.create({
            eventId: EventId.fromString(evId),
            userId: UserId.fromString(userId),
            attendeeName: 'Test',
            ticketTypeId: EventTicketTypeId.fromString('type-1'),
            price: Money.fromAmount(10, 'USD'),
          });
        }
      });

      it('Then returns paginated event IDs', async () => {
        const res = await request(app.getHttpServer())
          .get(`/users/${userId}/events`)
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(200);

        const body = res.body as PaginatedResponseDto<string>;
        expect(body.totalItems).toBe(3);
        expect(body.items).toHaveLength(3);
      });

      it('Then filters by event status', async () => {
        const res = await request(app.getHttpServer())
          .get(`/users/${userId}/events`)
          .query({ status: 'PUBLISHED' })
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(200);

        const body = res.body as PaginatedResponseDto<string>;
        expect(body.totalItems).toBe(2);
        expect(body.items).toEqual(expect.arrayContaining(['ev-1', 'ev-2']));
      });

      it('Then returns events sorted by date asc', async () => {
        const res = await request(app.getHttpServer())
          .get(`/users/${userId}/events`)
          .query({ order: 'asc' })
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(200);

        const body = res.body as PaginatedResponseDto<string>;
        expect(body.items).toEqual(['ev-1', 'ev-2', 'ev-3']);
      });

      it('Then returns events sorted by date desc', async () => {
        const res = await request(app.getHttpServer())
          .get(`/users/${userId}/events`)
          .query({ order: 'desc' })
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(200);

        const body = res.body as PaginatedResponseDto<string>;
        expect(body.items).toEqual(['ev-3', 'ev-2', 'ev-1']);
      });
    });

    it('Then returns 401 without auth', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}/events`)
        .expect(401);
    });

    it('Then returns 403 for another user', async () => {
      await request(app.getHttpServer())
        .get(`/users/${anotherUserId}/events`)
        .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
        .expect(403);
    });
  });

  // ─── GET /users/:userId/events/:eventId/pdf ───────────────────────────────

  describe('/users/:userId/events/:eventId/pdf (GET)', () => {
    describe('Given a user with ACTIVE tickets for an event', () => {
      beforeEach(async () => {
        await eventService.createOrUpdate(
          eventId,
          'creator',
          'PUBLISHED',
          new Date('2025-12-01'),
        );
        await userModel.create({ _id: userId, language: 'en' });

        for (let i = 0; i < 2; i++) {
          await ticketService.create({
            eventId: EventId.fromString(eventId),
            userId: UserId.fromString(userId),
            attendeeName: `Attendee ${i}`,
            ticketTypeId: EventTicketTypeId.fromString('type-1'),
            price: Money.fromAmount(10, 'USD'),
            status: TicketStatus.ACTIVE,
          });
        }
      });

      it('Then returns 200 with a PDF', async () => {
        const res = await request(app.getHttpServer())
          .get(`/users/${userId}/events/${eventId}/pdf`)
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(200);

        expect(res.headers['content-type']).toMatch(/application\/pdf/);
      });
    });

    describe('Given no ACTIVE tickets for the event', () => {
      it('Then returns 404', async () => {
        await request(app.getHttpServer())
          .get(`/users/${userId}/events/${eventId}/pdf`)
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(404);
      });
    });

    it('Then returns 401 without auth', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}/events/${eventId}/pdf`)
        .expect(401);
    });

    it('Then returns 403 for another user', async () => {
      await request(app.getHttpServer())
        .get(`/users/${anotherUserId}/events/${eventId}/pdf`)
        .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
        .expect(403);
    });
  });
});
