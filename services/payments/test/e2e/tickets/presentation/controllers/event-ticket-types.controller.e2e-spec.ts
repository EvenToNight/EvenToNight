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
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { EventService } from 'src/tickets/application/services/event.service';
import { generateFakeToken, ONE_YEAR } from 'src/commons/utils/authUtils';

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
    ticketTypeId = ticketType.getId();
    const soldTicket = await ticketService.create({
      eventId: EventId.fromString(eventId),
      userId: UserId.fromString('user-1'),
      attendeeName: `Attendee 1`,
      ticketTypeId: ticketTypeId,
      price: Money.fromAmount(1, 'USD'),
      status: TicketStatus.ACTIVE,
    });
    soldTicketsIds.push(soldTicket.getId());
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

  //TODO: add tests for unauthorized access
  describe('PUT /ticket-types/:ticketTypeId', () => {
    describe('Given valid update data', () => {
      it('Then returns 200 and updates description', async () => {
        const dto = {
          description: 'Updated description',
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
          price: {
            amount: 75,
            currency: 'USD',
          },
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
          price: { amount: 75, currency: 'USD' },
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
  });
});
