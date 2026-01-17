process.env.NODE_ENV = 'development';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher } from 'src/commons/intrastructure/messaging/event-publisher';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import { PaginatedResponseDto } from 'src/commons/application/dto/paginated-response.dto';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { TicketDocument } from 'src/tickets/infrastructure/persistence/schemas/ticket.schema';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { generateFakeToken, ONE_HOUR } from 'src/commons/utils/authUtils';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let ticketService: TicketService;
  const userId = 'test-user-id';
  const anotherUserId = 'another-user-id';

  beforeAll(async () => {
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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    ticketService = moduleFixture.get<TicketService>(TicketService);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await ticketService.deleteAll();
  });

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
              limit: expect.any(Number) as number,
              offset: 0,
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
        const tickets: Ticket[] = [];
        for (let i = 1; i <= 15; i++) {
          tickets.push(
            await ticketService.create({
              eventId: EventId.fromString(`event-${i}`),
              userId: UserId.fromString(userId),
              attendeeName: `Attendee ${i}`,
              ticketTypeId: `type-${i}`,
              price: Money.fromAmount(i, 'USD'),
            }),
          );
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
              items: expect.any(Array) as TicketDocument[],
              totalItems: 15,
              limit: limit,
              offset: offset,
              hasMore: true,
            }),
          );
          expect(body.items).toHaveLength(5);
        });
      });
    });
  });
});
