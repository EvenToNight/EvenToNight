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
import { EventService } from 'src/tickets/application/services/event.service';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';

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
  let eventService: EventService;
  const ticketId = 'test-ticket-id';
  const eventId = 'test-event-id';
  const eventCreatorId = 'test-event-creator-id';
  const userId = `test-user-id`;
  const anotherUserId = `another-user-id`;

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
      eventService = moduleFixture.get<EventService>(EventService);
    });

    afterAll(async () => {
      await app.close();
      await mongod.stop();
    });

    beforeEach(async () => {
      await ticketService.deleteAll();
      await eventService.deleteAll();
    });

    describe('GET /tickets/:ticketId', () => {
      describe('Given a non existing ticketId', () => {
        describe('When an authenticated user requests the ticket details', () => {
          it('Then returns 404 Not Found', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/test-${ticketId}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .expect(404);
          });
        });
        describe('When an unauthenticated user requests the ticket details', () => {
          it('Then returns 401 Unauthorized', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/test-${ticketId}`)
              .expect(401);
          });
        });
      });
      describe('Given an existing ticketId', () => {
        let ticket: Ticket;
        beforeEach(async () => {
          ticket = await ticketService.create({
            eventId: EventId.fromString(eventId),
            userId: UserId.fromString(userId),
            attendeeName: `Attendee 1`,
            ticketTypeId: `type-1`,
            price: Money.fromAmount(1, 'USD'),
            status: TicketStatus.ACTIVE,
          });
          await eventService.create(eventId, eventCreatorId);
        });
        describe('When the user owner requests the ticket details', () => {
          it('Then returns the ticket details', async () => {
            const res = await request(app.getHttpServer())
              .get(`/tickets/${ticket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .expect(200);

            expect(res.body).toMatchObject({
              id: ticket.getId(),
              userId: ticket.getUserId(),
              eventId: ticket.getEventId(),
              attendeeName: ticket.getAttendeeName(),
              ticketTypeId: ticket.getTicketTypeId(),
              price: ticket.getPrice(),
              status: ticket.getStatus(),
            });
          });
        });
        describe('When a different user requests the ticket details', () => {
          it('Then returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/${ticket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(anotherUserId, ONE_HOUR)}`,
              )
              .expect(403);
          });
        });
        describe('When the event creator modifies the ticket', () => {
          describe('When no body is provided', () => {
            it('Then update ticket status to USED', async () => {
              expect(ticket.isActive()).toBe(true);
              const response = await request(app.getHttpServer())
                .patch(`/tickets/${ticket.getId()}`)
                .set(
                  'Authorization',
                  `Bearer ${generateFakeToken(eventCreatorId, ONE_HOUR)}`,
                )
                .send()
                .expect(200);

              expect(
                (response.body as { status: { value: string } }).status.value,
              ).toBe('USED');
            });
          });
          describe("When a body with { status: 'USED' } is provided", () => {
            it('Then update ticket status to USED', async () => {
              expect(ticket.isActive()).toBe(true);
              const response = await request(app.getHttpServer())
                .patch(`/tickets/${ticket.getId()}`)
                .set(
                  'Authorization',
                  `Bearer ${generateFakeToken(eventCreatorId, ONE_HOUR)}`,
                )
                .send({ status: 'USED' })
                .expect(200);

              expect(
                (response.body as { status: { value: string } }).status.value,
              ).toBe('USED');
            });
          });
          describe('When a body with other values is provided', () => {
            it('Then returns 400 Bad Request', async () => {
              await request(app.getHttpServer())
                .patch(`/tickets/${ticket.getId()}`)
                .set(
                  'Authorization',
                  `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
                )
                .send({ status: 'ACTIVE' })
                .expect(400);
            });
          });
        });
        describe('When the user owner modifies the ticket', () => {
          it('Then returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .patch(`/tickets/${ticket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .send()
              .expect(403);
          });
        });
        describe('When another user modifies the ticket', () => {
          it('Then returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .patch(`/tickets/${ticket.getId()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(anotherUserId, ONE_HOUR)}`,
              )
              .send()
              .expect(403);
          });
        });
        describe('When modifying a non existing ticketId', () => {
          it('Then returns 404 Not Found', async () => {
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
              .patch(`/tickets/${ticket.getId()}`)
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

      // .useValue({ canActivate: () => true })

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
