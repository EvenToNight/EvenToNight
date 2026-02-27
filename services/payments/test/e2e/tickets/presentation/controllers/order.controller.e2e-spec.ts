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
import { OrderService } from 'src/tickets/application/services/order.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { EventService } from 'src/tickets/application/services/event.service';
import { UserDocument } from 'src/tickets/infrastructure/persistence/schemas/user.schema';
import { generateFakeToken, ONE_HOUR } from '@libs/ts-common';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';

describe('OrderController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let orderService: OrderService;
  let ticketService: TicketService;
  let eventService: EventService;
  let userModel: Model<UserDocument>;

  const userId = 'test-user-id';
  const anotherUserId = 'another-user-id';
  const eventId = 'test-event-id';
  const creatorId = 'test-creator-id';

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

    orderService = moduleFixture.get<OrderService>(OrderService);
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
    await orderService.deleteAll();
    await ticketService.deleteAll();
    await eventService.deleteAll();
    await userModel.deleteMany({});
  });

  // ─── GET /orders/:orderId ─────────────────────────────────────────────────

  describe('GET /orders/:orderId', () => {
    describe('Given a non-existing order', () => {
      it('Then returns 404', async () => {
        await request(app.getHttpServer())
          .get('/orders/non-existing-order')
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(404);
      });
    });

    describe('Given no auth', () => {
      it('Then returns 401', async () => {
        await request(app.getHttpServer())
          .get('/orders/any-order-id')
          .expect(401);
      });
    });

    describe('Given an existing order', () => {
      let orderId: string;

      beforeEach(async () => {
        const ticket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Attendee',
          ticketTypeId: EventTicketTypeId.fromString('type-1'),
          price: Money.fromAmount(50, 'USD'),
          status: TicketStatus.ACTIVE,
        });

        const order = await orderService.createOrder(
          UserId.fromString(userId),
          EventId.fromString(eventId),
          [ticket.getId().toString()],
        );
        orderId = order.getId().toString();
      });

      describe('When the owner requests the order', () => {
        it('Then returns 200 with the order details', async () => {
          const res = await request(app.getHttpServer())
            .get(`/orders/${orderId}`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(userId, ONE_HOUR)}`,
            )
            .expect(200);

          expect((res.body as { id: string }).id).toBeDefined();
        });
      });

      describe('When a different user requests the order', () => {
        it('Then returns 403 Forbidden', async () => {
          await request(app.getHttpServer())
            .get(`/orders/${orderId}`)
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(anotherUserId, ONE_HOUR)}`,
            )
            .expect(403);
        });
      });
    });
  });

  // ─── GET /orders/:orderId/pdf ─────────────────────────────────────────────

  describe('GET /orders/:orderId/pdf', () => {
    describe('Given a non-existing order', () => {
      it('Then returns 404', async () => {
        await request(app.getHttpServer())
          .get('/orders/non-existing-order/pdf')
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(404);
      });
    });

    describe('Given no auth', () => {
      it('Then returns 401', async () => {
        await request(app.getHttpServer())
          .get('/orders/any-order-id/pdf')
          .expect(401);
      });
    });

    describe('Given an existing order belonging to another user', () => {
      let orderId: string;

      beforeEach(async () => {
        const ticket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Attendee',
          ticketTypeId: EventTicketTypeId.fromString('type-1'),
          price: Money.fromAmount(50, 'USD'),
          status: TicketStatus.ACTIVE,
        });

        const order = await orderService.createOrder(
          UserId.fromString(userId),
          EventId.fromString(eventId),
          [ticket.getId().toString()],
        );
        orderId = order.getId().toString();
      });

      it('Then returns 403 Forbidden when accessed by another user', async () => {
        await request(app.getHttpServer())
          .get(`/orders/${orderId}/pdf`)
          .set(
            'Authorization',
            `Bearer ${generateFakeToken(anotherUserId, ONE_HOUR)}`,
          )
          .expect(403);
      });
    });

    describe('Given an order and tickets exist but event does not', () => {
      let orderId: string;

      beforeEach(async () => {
        await userModel.create({ _id: userId, language: 'en' });

        const ticket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Attendee',
          ticketTypeId: EventTicketTypeId.fromString('type-1'),
          price: Money.fromAmount(50, 'USD'),
          status: TicketStatus.ACTIVE,
        });

        const order = await orderService.createOrder(
          UserId.fromString(userId),
          EventId.fromString(eventId),
          [ticket.getId().toString()],
        );
        orderId = order.getId().toString();
        // Event is NOT created
      });

      it('Then returns 404 Not Found', async () => {
        await request(app.getHttpServer())
          .get(`/orders/${orderId}/pdf`)
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(404);
      });
    });

    describe('Given a complete setup (order, tickets, event, user)', () => {
      let orderId: string;

      beforeEach(async () => {
        await eventService.createOrUpdate(
          eventId,
          creatorId,
          'PUBLISHED',
          new Date('2025-12-01'),
        );
        await userModel.create({ _id: userId, language: 'en' });

        const ticket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Attendee',
          ticketTypeId: EventTicketTypeId.fromString('type-1'),
          price: Money.fromAmount(50, 'USD'),
          status: TicketStatus.ACTIVE,
        });

        const order = await orderService.createOrder(
          UserId.fromString(userId),
          EventId.fromString(eventId),
          [ticket.getId().toString()],
        );
        orderId = order.getId().toString();
      });

      it('Then returns 200 with a PDF for the owner', async () => {
        const res = await request(app.getHttpServer())
          .get(`/orders/${orderId}/pdf`)
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_HOUR)}`)
          .expect(200);

        expect(res.headers['content-type']).toMatch(/application\/pdf/);
      });
    });
  });
});
