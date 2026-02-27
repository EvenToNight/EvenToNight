process.env.NODE_ENV = 'development';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { JwtAuthGuard } from '@libs/nestjs-common';
import { generateFakeToken, ONE_HOUR } from '@libs/ts-common';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { EventService } from 'src/tickets/application/services/event.service';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/tickets/infrastructure/persistence/schemas/user.schema';

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
    let userModel: Model<UserDocument>;

    beforeAll(async () => {
      jest.spyOn(console, 'warn').mockImplementation();
      mongod = await MongoMemoryServer.create();
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
      app.useLogger(false);
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
            ticketTypeId: EventTicketTypeId.fromString('type-1'),
            price: Money.fromAmount(1, 'USD'),
            status: TicketStatus.ACTIVE,
          });
          await eventService.createOrUpdate(
            eventId,
            eventCreatorId,
            'PUBLISHED',
            new Date(),
          );
        });
        describe('When the user owner requests the ticket details', () => {
          it('Then returns the ticket details', async () => {
            const res = await request(app.getHttpServer())
              .get(`/tickets/${ticket.getId().toString()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .expect(200);

            expect(res.body).toMatchObject({
              id: ticket.getId().toString(),
              userId: ticket.getUserId().toString(),
              eventId: ticket.getEventId().toString(),
              attendeeName: ticket.getAttendeeName(),
              ticketTypeId: ticket.getTicketTypeId().toString(),
              price: ticket.getPrice().toJSON(),
              status: { value: ticket.getStatus().toString() },
            });
          });
        });
        describe('When a different user requests the ticket details', () => {
          it('Then returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/${ticket.getId().toString()}`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(anotherUserId, ONE_HOUR)}`,
              )
              .expect(403);
          });
        });
        describe('When the event creator verifies the ticket', () => {
          describe('When no body is provided', () => {
            it('Then marks ticket as USED and returns 200', async () => {
              expect(ticket.isActive()).toBe(true);
              await request(app.getHttpServer())
                .put(`/tickets/${ticket.getId().toString()}/verify`)
                .set(
                  'Authorization',
                  `Bearer ${generateFakeToken(eventCreatorId, ONE_HOUR)}`,
                )
                .send()
                .expect(200);

              const updated = await ticketService.findById(
                ticket.getId().toString(),
              );
              expect(updated?.isUsed()).toBe(true);
            });
          });
          describe('When ticket was already verified', () => {
            it('Then returns 200 and ticket remains USED', async () => {
              await request(app.getHttpServer())
                .put(`/tickets/${ticket.getId().toString()}/verify`)
                .set(
                  'Authorization',
                  `Bearer ${generateFakeToken(eventCreatorId, ONE_HOUR)}`,
                )
                .send()
                .expect(200);

              await request(app.getHttpServer())
                .put(`/tickets/${ticket.getId().toString()}/verify`)
                .set(
                  'Authorization',
                  `Bearer ${generateFakeToken(eventCreatorId, ONE_HOUR)}`,
                )
                .send()
                .expect(200);

              const updated = await ticketService.findById(
                ticket.getId().toString(),
              );
              expect(updated?.isUsed()).toBe(true);
            });
          });
        });
        describe('When the user owner tries to verify the ticket', () => {
          it('Then returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .put(`/tickets/${ticket.getId().toString()}/verify`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .send()
              .expect(403);
          });
        });
        describe('When another user tries to verify the ticket', () => {
          it('Then returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .put(`/tickets/${ticket.getId().toString()}/verify`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(anotherUserId, ONE_HOUR)}`,
              )
              .send()
              .expect(403);
          });
        });
        describe('When verifying a non existing ticketId', () => {
          it('Then returns 404 Not Found', async () => {
            await request(app.getHttpServer())
              .put(`/tickets/non-existing-ticket/verify`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .send()
              .expect(404);
          });
        });
        describe('When verifying without token', () => {
          it('returns 401 Unauthorized', async () => {
            await request(app.getHttpServer())
              .put(`/tickets/${ticket.getId().toString()}/verify`)
              .send()
              .expect(401);
          });
        });
      });

      describe('Given a ticket exists but the event does not', () => {
        let ticketNoEvent: Ticket;

        beforeEach(async () => {
          ticketNoEvent = await ticketService.create({
            eventId: EventId.fromString(eventId),
            userId: UserId.fromString(userId),
            attendeeName: 'Attendee',
            ticketTypeId: EventTicketTypeId.fromString('type-1'),
            price: Money.fromAmount(1, 'USD'),
            status: TicketStatus.ACTIVE,
          });
          // No event created
        });

        it('PUT /tickets/:ticketId/verify returns 404 when event does not exist', async () => {
          await request(app.getHttpServer())
            .put(`/tickets/${ticketNoEvent.getId().toString()}/verify`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(eventCreatorId, ONE_HOUR)}`,
            )
            .send()
            .expect(404);
        });
      });
    });

    describe('GET /tickets/:ticketId/pdf', () => {
      describe('Given a non-existing ticket', () => {
        it('Then returns 404', async () => {
          await request(app.getHttpServer())
            .get('/tickets/non-existing-ticket/pdf')
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
            )
            .expect(404);
        });
      });

      describe('Given an existing ticket', () => {
        let ticket: Ticket;

        beforeEach(async () => {
          ticket = await ticketService.create({
            eventId: EventId.fromString(eventId),
            userId: UserId.fromString(userId),
            attendeeName: 'Attendee 1',
            ticketTypeId: EventTicketTypeId.fromString('type-1'),
            price: Money.fromAmount(10, 'USD'),
            status: TicketStatus.ACTIVE,
          });
        });

        describe('When a different user requests the PDF', () => {
          it('Then returns 403 Forbidden', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/${ticket.getId().toString()}/pdf`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(anotherUserId, ONE_HOUR)}`,
              )
              .expect(403);
          });
        });

        describe('When the owner requests the PDF but event does not exist', () => {
          it('Then returns 404 Not Found', async () => {
            await request(app.getHttpServer())
              .get(`/tickets/${ticket.getId().toString()}/pdf`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .expect(404);
          });
        });

        describe('When the owner requests the PDF with event and user set up', () => {
          beforeEach(async () => {
            await eventService.createOrUpdate(
              eventId,
              eventCreatorId,
              'PUBLISHED',
              new Date('2025-12-01'),
            );
            await userModel.create({ _id: userId, language: 'en' });
          });

          it('Then returns 200 with a PDF', async () => {
            const res = await request(app.getHttpServer())
              .get(`/tickets/${ticket.getId().toString()}/pdf`)
              .set(
                'Authorization',
                `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
              )
              .expect(200);

            expect(res.headers['content-type']).toMatch(/application\/pdf/);
          });
        });
      });
    });
  });
  describe('With mocked auth guard (bypass)', () => {
    beforeAll(async () => {
      jest.spyOn(console, 'warn').mockImplementation();
      mongod = await MongoMemoryServer.create();
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
        .overrideGuard(JwtAuthGuard)
        .useValue(createMockGuard(userId))
        .overrideProvider(OutboxRelayService)
        .useValue({})
        .compile();

      // .useValue({ canActivate: () => true })

      app = moduleFixture.createNestApplication();
      app.useLogger(false);
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
