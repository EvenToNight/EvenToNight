process.env.NODE_ENV = 'development';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher } from 'src/commons/intrastructure/messaging/event-publisher';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { JwtAuthGuard } from 'src/commons/infrastructure/auth/jwt-auth.guard';
import { generateFakeToken, ONE_HOUR } from 'src/commons/utils/authUtils';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';

const createMockGuard = (mockUserId: string) => ({
  canActivate: (context: ExecutionContext) => {
    const req = context
      .switchToHttp()
      .getRequest<{ user?: { userId: string } }>();
    req.user = { userId: mockUserId };
    return true;
  },
});

describe('TicketsController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let ticketService: TicketService;
  const ticketId = 'ticket-123';
  const userId = 'user-123';

  describe('With real auth guard', () => {
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
    describe('GET /tickets/:ticketId', () => {
      describe('Given a non existing ticketId', () => {
        describe('When requesting the ticket details', () => {
          it('returns 404 for non existing ticket with valid token', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/test-${ticketId}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .expect(404);
          });

          it('returns 401 without auth header', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/test-${ticketId}`)
              .expect(401);
          });
        });
      });
      describe('Given an existing ticketId', () => {
        let createdTicket: Ticket;
        beforeEach(async () => {
          createdTicket = await ticketService.create({
            eventId: EventId.fromString(`event-1`),
            userId: UserId.fromString(userId),
            attendeeName: `Attendee 1`,
            ticketTypeId: `type-1`,
            price: Money.fromAmount(1, 'USD'),
          });
        });
        describe('When the user owner requests the ticket details', () => {
          it('returns 200 with the ticket details', async () => {
            const res = await request(app.getHttpServer())
              .get(`/tickets/${createdTicket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .expect(200);

            expect(res.body).toMatchObject({
              id: createdTicket.getId(),
              userId: createdTicket.getUserId(),
              eventId: createdTicket.getEventId(),
              attendeeName: createdTicket.getAttendeeName(),
              ticketTypeId: createdTicket.getTicketTypeId(),
              price: createdTicket.getPrice(),
              status: createdTicket.getStatus(),
            });
          });
        });
        describe('When a different user requests the ticket details', () => {
          it('returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/${createdTicket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken('different-user', ONE_HOUR)}`,
              )
              .expect(403);
          });
        });
        describe('When requesting the ticket details without token', () => {
          it('returns 401 Unauthorized', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/${createdTicket.getId()}`)
              .expect(401);
          });
        });
        describe('When the owner user modifies the ticket', () => {
          it('use the ticket if no body is provided', async () => {
            expect(createdTicket.isActive()).toBe(true);
            const response = await request(app.getHttpServer())
              .patch(`/tickets/${createdTicket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .send()
              .expect(200);

            expect(
              (response.body as { status: { value: string } }).status.value,
            ).toBe('USED');
          });
          it("accept { status: 'USED' } body", async () => {
            expect(createdTicket.isActive()).toBe(true);
            const response = await request(app.getHttpServer())
              .patch(`/tickets/${createdTicket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .send({ status: 'USED' })
              .expect(200);

            expect(
              (response.body as { status: { value: string } }).status.value,
            ).toBe('USED');
          });
          it('reject all other values', async () => {
            await request(app.getHttpServer())
              .patch(`/tickets/${createdTicket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .send({ status: 'ACTIVE' })
              .expect(400);
          });
        });
        describe('When a different user modifies the ticket', () => {
          it('prevents modification', async () => {
            await request(app.getHttpServer())
              .patch(`/tickets/${createdTicket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken('different-user', ONE_HOUR)}`,
              )
              .send()
              .expect(403);
          });
        });
        describe('When modifying a non existing ticketId', () => {
          it('returns 404 Not Found', async () => {
            await request(app.getHttpServer())
              .patch(`/tickets/non-existing-ticket`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .send()
              .expect(404);
          });
        });
        describe('When modifying the ticket without token', () => {
          it('returns 401 Unauthorized', async () => {
            await request(app.getHttpServer())
              .patch(`/tickets/${createdTicket.getId()}`)
              .send()
              .expect(401);
          });
        });
      });
    });
  });
  describe('With mocked auth guard (bypass)', () => {
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
        .overrideGuard(JwtAuthGuard)
        .useValue(createMockGuard(userId))
        .compile();

      // .useValue({ canActivate: () => true }) --- IGNORE ---

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

    describe('GET /tickets/:ticketId', () => {
      describe('Given a non existing ticketId', () => {
        describe('When requesting the ticket details', () => {
          it('returns 404 for non existing ticket (guard bypassed)', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/test-${ticketId}`)
              .expect(404);
          });
        });
      });
    });
  });
});
