process.env.NODE_ENV = 'development';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  PAYMENT_SERVICE,
  PaymentService,
} from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher } from 'src/commons/intrastructure/messaging/event-publisher';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { OrderService } from 'src/tickets/application/services/order.service';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { generateFakeToken, ONE_YEAR } from 'src/commons/utils/authUtils';
import { CreateCheckoutSessionDto } from 'src/tickets/application/dto/create-checkout-session.dto';
import { CheckoutSession } from 'src/tickets/domain/types/payment-service.types';

describe('CheckoutSessionsController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let eventTicketTypeService: EventTicketTypeService;
  let ticketService: TicketService;
  let orderService: OrderService;
  let mockPaymentService: jest.Mocked<PaymentService>;

  const userId = 'test-user-id';
  const eventId = 'test-event-id';
  let ticketTypeId: string;
  let dto: CreateCheckoutSessionDto;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    mockPaymentService = {
      createCheckoutSessionWithItems: jest.fn(),
      getCheckoutSession: jest.fn(),
      expireCheckoutSession: jest.fn(),
      constructWebhookEvent: jest.fn(),
    };

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
      .useValue(mockPaymentService)
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
    orderService = moduleFixture.get<OrderService>(OrderService);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await ticketService.deleteAll();
    await orderService.deleteAll();
    await eventTicketTypeService.deleteAll();
    jest.clearAllMocks();

    const ticketType = await eventTicketTypeService.create({
      eventId: EventId.fromString(eventId),
      type: TicketType.fromString('STANDARD'),
      description: 'Standard ticket',
      price: Money.fromAmount(50, 'EUR'),
      availableQuantity: 100,
      soldQuantity: 0,
    });
    ticketTypeId = ticketType.getId();
    dto = {
      userId,
      items: [
        { ticketTypeId, attendeeName: 'John Doe' },
        { ticketTypeId, attendeeName: 'Jane Doe' },
      ],
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
    };
  });

  describe('POST /checkout-sessions', () => {
    describe('Given valid checkout session data', () => {
      it('Then returns 401 Unauthorized when no token is provided', async () => {
        await request(app.getHttpServer())
          .post('/checkout-sessions')
          .send(dto)
          .expect(401);
      });
      it('Then returns 403 Forbidden when userId in token does not match body', async () => {
        await request(app.getHttpServer())
          .post('/checkout-sessions')
          .set(
            'Authorization',
            `Bearer ${generateFakeToken('different-user-id', ONE_YEAR)}`,
          )
          .send(dto)
          .expect(403);
      });
      it('Then returns 201 and creates checkout session (dev mode)', async () => {
        // In dev mode, the handler returns a dev mock response without calling PaymentService
        const res = await request(app.getHttpServer())
          .post('/checkout-sessions')
          .set('Authorization', `Bearer ${generateFakeToken(userId, ONE_YEAR)}`)
          .send(dto)
          .expect(201);

        expect(res.body).toMatchObject({
          sessionId: expect.any(String) as string,
          redirectUrl: expect.any(String) as string,
          orderId: expect.any(String) as string,
        });

        const orderId = (res.body as { orderId: string }).orderId;
        const order = await orderService.findById(orderId);
        expect(order).not.toBeNull();
        expect(order?.getTicketIds()).toHaveLength(2);
        const tickets = await ticketService.findByIds(order!.getTicketIds());
        expect(tickets).toHaveLength(2);
        for (const ticket of tickets) {
          expect(ticket.isPendingPayment()).toBe(true);
        }
        const ticketType = await eventTicketTypeService.findById(ticketTypeId);
        expect(ticketType?.getSoldQuantity()).toBe(2);
        expect(ticketType?.getAvailableQuantity()).toBe(98);
      });
    });

    //TODO: missing param validation tests

    describe('GET /checkout-sessions/:sessionId/cancel', () => {
      const redirectTo = 'http://localhost:3000/cancelled';

      describe('Given an open checkout session', () => {
        it('expires the session and redirects', async () => {
          const sessionCreationReq = await request(app.getHttpServer())
            .post('/checkout-sessions')
            .set(
              'Authorization',
              `Bearer ${generateFakeToken(userId, ONE_YEAR)}`,
            )
            .send(dto)
            .expect(201);

          const sessionId = (sessionCreationReq.body as { sessionId: string })
            .sessionId;
          const orderId = (sessionCreationReq.body as { orderId: string })
            .orderId;

          const mockSession: CheckoutSession = {
            id: sessionId,
            redirectUrl: null,
            expiresAt: Date.now(),
            orderId: orderId,
            status: 'open',
          };

          mockPaymentService.getCheckoutSession.mockResolvedValue(mockSession);

          const res = await request(app.getHttpServer())
            .get(`/checkout-sessions/${sessionId}/cancel`)
            .query({ redirect_to: redirectTo });

          expect(res.status).toBe(302);
          expect(res.headers.location).toBe(redirectTo);

          const order = await orderService.findById(orderId);
          expect(order?.isCancelled()).toBe(true);
          const tickets = await ticketService.findByIds(order!.getTicketIds());
          for (const ticket of tickets) {
            expect(ticket.isPaymentFailed()).toBe(true);
          }
          const ticketType =
            await eventTicketTypeService.findById(ticketTypeId);
          expect(ticketType?.getAvailableQuantity()).toBe(100);
          expect(ticketType?.getSoldQuantity()).toBe(0);
        });
      });

      describe('Given an already completed session', () => {
        it('does not expire and just redirects', async () => {
          const sessionId = 'completed-session-id';
          const mockSession: CheckoutSession = {
            id: sessionId,
            redirectUrl: null,
            expiresAt: Date.now(),
            orderId: 'orderId',
            status: 'complete',
          };

          mockPaymentService.getCheckoutSession.mockResolvedValue(mockSession);

          const res = await request(app.getHttpServer())
            .get(`/checkout-sessions/${sessionId}/cancel`)
            .query({ redirect_to: redirectTo });

          expect(res.status).toBe(302);
          expect(res.headers.location).toBe(redirectTo);
          expect(
            mockPaymentService.expireCheckoutSession.mock.calls,
          ).toHaveLength(0);
        });
      });

      describe('Given an error during cancellation', () => {
        it('still redirects to avoid user being stuck', async () => {
          const sessionId = 'completed-session-id';
          mockPaymentService.getCheckoutSession.mockRejectedValue(
            new Error('Session not found'),
          );

          const res = await request(app.getHttpServer())
            .get(`/checkout-sessions/${sessionId}/cancel`)
            .query({ redirect_to: redirectTo });

          expect(res.status).toBe(302);
          expect(res.headers.location).toBe(redirectTo);
        });
      });
    });
  });
});
