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
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { EventService } from 'src/tickets/application/services/event.service';
import { generateFakeToken, ONE_YEAR } from 'src/commons/utils/authUtils';

describe('EventController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let eventTicketTypeService: EventTicketTypeService;
  let ticketService: TicketService;
  let eventService: EventService;

  const eventId = 'test-event-id';
  const creatorId = 'test-creator-id';
  let ticketType1: EventTicketType;
  let soldTicketsIds: string[] = [];

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
        createCheckoutSessionWithItems: jest.fn(),
        getCheckoutSession: jest.fn(),
        expireCheckoutSession: jest.fn(),
        constructWebhookEvent: jest.fn(),
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
    eventTicketTypeService = moduleFixture.get<EventTicketTypeService>(
      EventTicketTypeService,
    );
    ticketService = moduleFixture.get<TicketService>(TicketService);
    eventService = moduleFixture.get<EventService>(EventService);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await eventTicketTypeService.deleteAll();
    await eventService.deleteAll();
    await eventService.create(eventId, creatorId);
    await eventService.create('no-ticket-event', creatorId);
    soldTicketsIds = [];

    ticketType1 = await eventTicketTypeService.create({
      eventId: EventId.fromString(eventId),
      type: TicketType.fromString('STANDARD'),
      description: 'Standard ticket',
      price: Money.fromAmount(50, 'EUR'),
      availableQuantity: 99,
      soldQuantity: 1,
    });

    await eventTicketTypeService.create({
      eventId: EventId.fromString(eventId),
      type: TicketType.fromString('VIP'),
      description: 'VIP ticket',
      price: Money.fromAmount(150, 'EUR'),
      availableQuantity: 50,
      soldQuantity: 0,
    });

    const soldTicket = await ticketService.create({
      eventId: EventId.fromString(eventId),
      userId: UserId.fromString('user-1'),
      attendeeName: `Attendee 1`,
      ticketTypeId: ticketType1.getId(),
      price: Money.fromAmount(1, 'USD'),
      status: TicketStatus.ACTIVE,
    });
    soldTicketsIds.push(soldTicket.getId());
  });
  describe('GET /events/:eventId/ticket-types', () => {
    describe('Given no ticket types for the event', () => {
      describe('When fetching ticket types for the event', () => {
        it('Then returns 200 with empty array', async () => {
          const res = await request(app.getHttpServer())
            .get(`/events/no-ticket-event/ticket-types`)
            .expect(200);

          expect(res.body).toEqual([]);
        });
      });
    });

    describe('Given existing ticket types for the event', () => {
      describe('When fetching ticket types for the event', () => {
        it('Then returns 200 with the ticket types', async () => {
          const res = await request(app.getHttpServer())
            .get(`/events/${eventId}/ticket-types`)
            .expect(200);

          expect(res.body).toHaveLength(2);
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                eventId,
                type: 'STANDARD',
                description: 'Standard ticket',
              }),
              expect.objectContaining({
                eventId,
                type: 'VIP',
                description: 'VIP ticket',
              }),
            ]),
          );
        });
      });
    });
  });
  //TODO: add tests for unauthorized access
  describe('POST /events/:eventId/ticket-types', () => {
    describe('Given valid ticket type data', () => {
      describe('When creating a new ticket type for the event', () => {
        it('Then returns 201 and creates the ticket type', async () => {
          const dto = {
            type: 'VIP',
            description: 'VIP entry ticket',
            price: 59.99,
            currency: 'EUR',
            quantity: 100,
            creatorId,
          };

          const res = await request(app.getHttpServer())
            .post(`/events/another-event-id/ticket-types`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
            )
            .send(dto)
            .expect(201);

          expect(res.body).toMatchObject({
            eventId: 'another-event-id',
            type: 'VIP',
            description: 'VIP entry ticket',
            availableQuantity: 100,
          });
          expect((res.body as { id: string }).id).toBeDefined();
        });
      });
    });

    describe('Given invalid ticket type', () => {
      describe('When creating a new ticket type', () => {
        it('Then returns 400 for invalid type value', async () => {
          const dto = {
            type: 'INVALID_TYPE',
            price: 29.99,
            quantity: 100,
            creatorId,
          };

          const res = await request(app.getHttpServer())
            .post(`/events/${eventId}/ticket-types`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
            )
            .send(dto)
            .expect(400);

          expect((res.body as { message: string[] }).message).toEqual(
            expect.arrayContaining([
              expect.stringContaining('type must be one of'),
            ]),
          );
        });
      });
    });

    describe('Given missing required fields', () => {
      describe('When creating a new ticket type', () => {
        it('Then returns 400 for missing price', async () => {
          const dto = {
            type: 'STANDARD',
            quantity: 100,
            creatorId,
          };

          await request(app.getHttpServer())
            .post(`/events/${eventId}/ticket-types`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
            )
            .send(dto)
            .expect(400);
        });

        it('Then returns 400 for missing quantity', async () => {
          const dto = {
            type: 'STANDARD',
            price: 29.99,
            creatorId,
          };

          await request(app.getHttpServer())
            .post(`/events/${eventId}/ticket-types`)
            .send(dto)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
            )
            .expect(400);
        });
      });
    });

    describe('Given duplicate ticket type for the same event', () => {
      describe('When creating a new ticket type', () => {
        it('Then returns 409 Conflict', async () => {
          const dto = {
            type: ticketType1.getType().toString(),
            description: 'another ticket',
            price: 1500,
            currency: 'EUR',
            quantity: 30,
            creatorId,
          };

          await request(app.getHttpServer())
            .post(`/events/${eventId}/ticket-types`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
            )
            .send(dto)
            .expect(409);
        });
      });
    });
  });

  //TODO: add tests for unauthorized access
  describe('DELETE /events/:eventId/ticket-types', () => {
    describe('Given existing ticket types for the event', () => {
      describe('When deleting ticket types', () => {
        it('returns 204 and deletes all ticket types', async () => {
          const initial = await eventTicketTypeService.findByEventId(eventId);
          const intitalSoldTickets = await Promise.all(
            soldTicketsIds.map((t) => ticketService.findById(t)),
          );
          expect(intitalSoldTickets).toHaveLength(soldTicketsIds.length);
          for (const ticket of intitalSoldTickets) {
            expect(ticket?.getStatus().toString()).toBe('ACTIVE');
          }
          expect(initial).toHaveLength(2);
          await request(app.getHttpServer())
            .delete(`/events/${eventId}/ticket-types`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
            )
            .expect(204);

          const remaining = await eventTicketTypeService.findByEventId(eventId);
          expect(remaining).toHaveLength(0);
          const finalSoldTickets = await Promise.all(
            soldTicketsIds.map((t) => ticketService.findById(t)),
          );
          expect(finalSoldTickets).toHaveLength(soldTicketsIds.length);
          for (const ticket of finalSoldTickets) {
            expect(ticket?.getStatus().toString()).toBe('CANCELLED');
          }
        });
      });
    });

    describe('Given no ticket types for the event', () => {
      describe('When deleting ticket types', () => {
        it('returns 204 (idempotent)', async () => {
          await request(app.getHttpServer())
            .delete(`/events/no-ticket-event/ticket-types`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
            )
            .expect(204);
        });
      });
    });
  });
});
