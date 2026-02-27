process.env.NODE_ENV = 'development';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { EventService } from 'src/tickets/application/services/event.service';
import { generateFakeToken, ONE_YEAR } from '@libs/ts-common';

describe('EventTicketTypesController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let eventTicketTypeService: EventTicketTypeService;
  let ticketService: TicketService;
  let eventService: EventService;

  const eventId = 'test-event-id';
  const creatorId = 'test-creator-id';
  let ticketTypeId: string;
  let soldTicketsIds: string[] = [];

  beforeAll(async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    process.env.MONGO_URI = mongoUri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
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
    await ticketService.deleteAll();
    await eventService.deleteAll();
    await eventService.createOrUpdate(
      eventId,
      creatorId,
      'PUBLISHED',
      new Date(),
    );
    soldTicketsIds = [];

    const ticketType = await eventTicketTypeService.create({
      eventId: EventId.fromString(eventId),
      type: TicketType.fromString('STANDARD'),
      description: 'Standard ticket',
      price: Money.fromAmount(50, 'USD'),
      availableQuantity: 100,
      soldQuantity: 5,
    });
    ticketTypeId = ticketType.getId().toString();
    const soldTicket = await ticketService.create({
      eventId: EventId.fromString(eventId),
      userId: UserId.fromString('user-1'),
      attendeeName: `Attendee 1`,
      ticketTypeId: EventTicketTypeId.fromString(ticketTypeId),
      price: Money.fromAmount(1, 'USD'),
      status: TicketStatus.ACTIVE,
    });
    soldTicketsIds.push(soldTicket.getId().toString());
  });

  describe('GET /ticket-types/values', () => {
    it('Then returns 200 with all ticket type values', async () => {
      const res = await request(app.getHttpServer())
        .get('/ticket-types/values')
        .expect(200);

      expect(res.body).toEqual(
        expect.arrayContaining(TicketType.getAllValues()),
      );
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /ticket-types/:ticketTypeId', () => {
    describe('Given an existing ticket type', () => {
      it('Then returns 200 with the ticket type details', async () => {
        const res = await request(app.getHttpServer())
          .get(`/ticket-types/${ticketTypeId}`)
          .expect(200);

        expect(res.body).toMatchObject({
          id: ticketTypeId,
          eventId,
          type: 'STANDARD',
          description: 'Standard ticket',
          availableQuantity: 100,
          soldQuantity: 5,
        });
      });
    });

    describe('Given a non-existing ticket type', () => {
      it('Then returns 404 Not Found', async () => {
        const res = await request(app.getHttpServer())
          .get('/ticket-types/non-existing-id')
          .expect(404);

        expect((res.body as { message: string }).message).toContain(
          'not found',
        );
      });
    });
  });

  describe('GET /ticket-types/:ticketTypeId (auth-restricted)', () => {
    const draftEventId = 'draft-event-id';
    let draftTicketTypeId: string;

    beforeEach(async () => {
      await eventService.createOrUpdate(
        draftEventId,
        creatorId,
        'DRAFT',
        new Date(),
      );
      const draftTicketType = await eventTicketTypeService.create({
        eventId: EventId.fromString(draftEventId),
        type: TicketType.fromString('VIP'),
        description: 'VIP ticket',
        price: Money.fromAmount(100, 'USD'),
        availableQuantity: 10,
        soldQuantity: 0,
      });
      draftTicketTypeId = draftTicketType.getId().toString();
    });

    describe('Given a ticket type in a DRAFT event without auth', () => {
      it('Then returns 403 Forbidden', async () => {
        await request(app.getHttpServer())
          .get(`/ticket-types/${draftTicketTypeId}`)
          .expect(403);
      });
    });

    describe('Given a ticket type in a DRAFT event with a non-creator user', () => {
      it('Then returns 403 Forbidden', async () => {
        await request(app.getHttpServer())
          .get(`/ticket-types/${draftTicketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken('other-user', ONE_YEAR)}`,
          )
          .expect(403);
      });
    });

    describe('Given a ticket type whose event is missing from DB', () => {
      it('Then returns 404 when event not found', async () => {
        // Delete the event but keep the ticket type
        await eventService.deleteAll();
        await request(app.getHttpServer())
          .get(`/ticket-types/${draftTicketTypeId}`)
          .expect(404);
      });
    });
  });

  //TODO: add tests for unauthorized access
  describe('PUT /ticket-types/:ticketTypeId', () => {
    describe('Given valid update data', () => {
      it('Then returns 200 and updates description', async () => {
        const dto = {
          description: 'Updated description',
          price: 50,
          quantity: 100,
        };

        const res = await request(app.getHttpServer())
          .put(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .send(dto)
          .expect(200);

        expect(res.body).toMatchObject({
          id: ticketTypeId,
          description: 'Updated description',
        });
      });

      it('Then returns 200 and updates quantity', async () => {
        const dto = {
          quantity: 200,
          price: 50,
        };

        const res = await request(app.getHttpServer())
          .put(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .send(dto)
          .expect(200);

        expect(res.body).toMatchObject({
          id: ticketTypeId,
          availableQuantity: 195,
          soldQuantity: 5,
          totalQuantity: 200,
        });
      });

      it('Then returns 200 and updates price', async () => {
        const dto = {
          price: 75,
          quantity: 100,
        };

        const res = await request(app.getHttpServer())
          .put(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .send(dto)
          .expect(200);

        expect(res.body).toMatchObject({
          id: ticketTypeId,
          price: 75,
        });
      });
    });

    describe('Given the new quantity is less than soldQuantity', () => {
      it('Then returns 200 and caps quantity at soldQuantity (sold out)', async () => {
        // beforeEach sets soldQuantity = 5, so quantity: 3 triggers updateTicketAndMakeSoldOut
        const dto = { price: 50, quantity: 3 };

        const res = await request(app.getHttpServer())
          .put(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .send(dto)
          .expect(200);

        expect(res.body).toMatchObject({
          id: ticketTypeId,
          soldQuantity: 5,
          totalQuantity: 5,
          availableQuantity: 0,
        });
      });
    });

    describe('Given invalid update data', () => {
      it('Then returns 400 for negative quantity', async () => {
        const dto = {
          quantity: -5,
        };

        await request(app.getHttpServer())
          .put(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .send(dto)
          .expect(400);
      });
    });

    describe('Given non-existing ticket type', () => {
      it('Then returns 404 Not Found', async () => {
        const dto = {
          description: 'New description',
          price: 50,
          quantity: 100,
        };

        await request(app.getHttpServer())
          .put('/ticket-types/non-existing-id')
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .send(dto)
          .expect(404);
      });
    });

    describe('Given a non-creator user', () => {
      it('Then returns 403 Forbidden', async () => {
        const dto = { description: 'Updated', price: 50, quantity: 100 };

        await request(app.getHttpServer())
          .put(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken('other-user', ONE_YEAR)}`,
          )
          .send(dto)
          .expect(403);
      });
    });
  });

  //TODO: add tests for unauthorized access
  describe('DELETE /ticket-types/:ticketTypeId', () => {
    describe('Given an existing ticket type', () => {
      it('Then returns returns 204', async () => {
        const initial = await eventTicketTypeService.findById(ticketTypeId);
        const intitalSoldTickets = await Promise.all(
          soldTicketsIds.map((t) => ticketService.findById(t)),
        );
        expect(intitalSoldTickets).toHaveLength(soldTicketsIds.length);
        for (const ticket of intitalSoldTickets) {
          expect(ticket?.getStatus().toString()).toBe('ACTIVE');
        }
        expect(initial).not.toBeNull();
        await request(app.getHttpServer())
          .delete(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .expect(204);

        const remaining = await eventTicketTypeService.findById(ticketTypeId);
        expect(remaining).toBeNull();
        const finalSoldTickets = await Promise.all(
          soldTicketsIds.map((t) => ticketService.findById(t)),
        );
        expect(finalSoldTickets).toHaveLength(soldTicketsIds.length);
        for (const ticket of finalSoldTickets) {
          expect(ticket?.getStatus().toString()).toBe('CANCELLED');
        }
      });
    });

    describe('Given the event has more than one ticket type', () => {
      it('Then deletes only the specified ticket type without deleting the event', async () => {
        const secondTicketType = await eventTicketTypeService.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('VIP'),
          description: 'VIP ticket',
          price: Money.fromAmount(100, 'USD'),
          availableQuantity: 10,
          soldQuantity: 0,
        });
        const secondTicketTypeId = secondTicketType.getId().toString();

        await request(app.getHttpServer())
          .delete(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .expect(204);

        const deleted = await eventTicketTypeService.findById(ticketTypeId);
        expect(deleted).toBeNull();

        const remaining =
          await eventTicketTypeService.findById(secondTicketTypeId);
        expect(remaining).not.toBeNull();
      });
    });

    //TODO evaluate returning 204 for idempotency
    describe('Given non-existing ticket type', () => {
      it('Then returns returns 404', async () => {
        await request(app.getHttpServer())
          .delete('/ticket-types/non-existing-id')
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(creatorId, ONE_YEAR)}`,
          )
          .expect(404);
      });
    });

    describe('Given a non-creator user', () => {
      it('Then returns 403 Forbidden', async () => {
        await request(app.getHttpServer())
          .delete(`/ticket-types/${ticketTypeId}`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken('other-user', ONE_YEAR)}`,
          )
          .expect(403);
      });
    });
  });
});
