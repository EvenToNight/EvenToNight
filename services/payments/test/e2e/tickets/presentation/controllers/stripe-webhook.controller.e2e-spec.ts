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
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { OrderService } from 'src/tickets/application/services/order.service';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { WebhookEvent } from 'src/tickets/domain/types/payment-service.types';
import { Order } from 'src/tickets/domain/aggregates/order.aggregate';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

describe('StripeWebhookController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let ticketService: TicketService;
  let orderService: OrderService;
  let eventTicketTypeService: EventTicketTypeService;
  let mockPaymentService: jest.Mocked<PaymentService>;

  const userId = 'user-123';
  const eventId = 'event-123';
  const sessionId = 'cs_test_123';

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

    app = moduleFixture.createNestApplication({
      rawBody: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    ticketService = moduleFixture.get<TicketService>(TicketService);
    orderService = moduleFixture.get<OrderService>(OrderService);
    eventTicketTypeService = moduleFixture.get<EventTicketTypeService>(
      EventTicketTypeService,
    );
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
  });

  describe('POST /webhooks/stripe', () => {
    describe('Given missing stripe-signature header', () => {
      it('returns 400 Bad Request', async () => {
        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .send({ some: 'data' });

        expect(res.status).toBe(400);
        expect((res.body as { message: string }).message).toBe(
          'Missing stripe-signature header',
        );
      });
    });

    describe('Given invalid signature', () => {
      it('returns 400 Bad Request when constructWebhookEvent throws', async () => {
        mockPaymentService.constructWebhookEvent.mockImplementation(() => {
          throw new Error('Invalid signature');
        });

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'invalid_sig')
          .send({ some: 'data' });

        expect(res.status).toBe(400);
        expect((res.body as { message: string }).message).toBe(
          'Webhook processing failed',
        );
      });
    });

    describe('Given a valid checkout.session.completed event', () => {
      let order: Order;
      let ticket1Id: string;
      let ticket2Id: string;
      let ticketTypeId: string;

      beforeEach(async () => {
        const ticketType = EventTicketType.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('STANDARD'),
          description: 'Standard ticket',
          price: Money.fromAmount(50, 'EUR'),
          availableQuantity: 100,
          soldQuantity: 0,
        });
        ticketTypeId = ticketType.getId();
        await eventTicketTypeService.save(ticketType);

        const ticket1 = Ticket.createPending({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'John Doe',
          ticketTypeId: ticketTypeId,
          price: Money.fromAmount(50, 'EUR'),
        });
        ticket1Id = ticket1.getId();
        await ticketService.save(ticket1);

        const ticket2 = Ticket.createPending({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Jane Doe',
          ticketTypeId: ticketTypeId,
          price: Money.fromAmount(50, 'EUR'),
        });
        ticket2Id = ticket2.getId();
        await ticketService.save(ticket2);

        order = Order.createPending({
          userId: UserId.fromString(userId),
          ticketIds: [ticket1Id, ticket2Id],
        });
        await orderService.save(order);
      });

      it('returns 200 and confirms tickets', async () => {
        const webhookEvent: WebhookEvent = {
          sessionId,
          type: 'checkout.session.completed',
          orderId: order.getId(),
        };

        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send(JSON.stringify({ id: 'evt_123' }));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ received: true });

        const updatedOrder = await orderService.findById(order.getId());
        expect(updatedOrder?.isCompleted()).toBe(true);
        const updatedTicket1 = await ticketService.findById(ticket1Id);
        expect(updatedTicket1?.isActive()).toBe(true);
        const updatedTicket2 = await ticketService.findById(ticket2Id);
        expect(updatedTicket2?.isActive()).toBe(true);
        const updatedTicketType =
          await eventTicketTypeService.findById(ticketTypeId);
        expect(updatedTicketType?.getAvailableQuantity()).toBe(98);
      });
    });

    describe('Given a valid checkout.session.expired event', () => {
      let order: Order;
      let ticketTypeId: string;
      let ticket1Id: string;
      let ticket2Id: string;

      beforeEach(async () => {
        const ticketType = EventTicketType.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('VIP'),
          description: 'VIP ticket',
          price: Money.fromAmount(100, 'EUR'),
          availableQuantity: 48,
          soldQuantity: 2,
        });
        await eventTicketTypeService.save(ticketType);
        ticketTypeId = ticketType.getId();

        const ticket1 = Ticket.createPending({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'John Doe',
          ticketTypeId: ticketTypeId,
          price: Money.fromAmount(100, 'EUR'),
        });
        ticket1Id = ticket1.getId();
        await ticketService.save(ticket1);

        const ticket2 = Ticket.createPending({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Jane Doe',
          ticketTypeId: ticketTypeId,
          price: Money.fromAmount(100, 'EUR'),
        });
        ticket2Id = ticket2.getId();
        await ticketService.save(ticket2);

        order = Order.createPending({
          userId: UserId.fromString(userId),
          ticketIds: [ticket1Id, ticket2Id],
        });
        await orderService.save(order);
      });

      it('returns 200 and cancels order, releases inventory', async () => {
        const webhookEvent: WebhookEvent = {
          sessionId,
          type: 'checkout.session.expired',
          orderId: order.getId(),
        };

        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send(JSON.stringify({ id: 'evt_123' }));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ received: true });

        const updatedOrder = await orderService.findById(order.getId());
        expect(updatedOrder?.isCancelled()).toBe(true);
        const updatedTicket1 = await ticketService.findById(ticket1Id);
        expect(updatedTicket1?.isPaymentFailed()).toBe(true);
        const updatedTicket2 = await ticketService.findById(ticket2Id);
        expect(updatedTicket2?.isPaymentFailed()).toBe(true);
        const updatedTicketType =
          await eventTicketTypeService.findById(ticketTypeId);
        expect(updatedTicketType?.getAvailableQuantity()).toBe(50);
      });
    });

    describe('Given an unhandled event type', () => {
      it('returns 200 with received: true (logs but does not fail)', async () => {
        const webhookEvent: WebhookEvent = {
          sessionId,
          type: 'payment_intent.succeeded',
          orderId: 'order-123',
        };

        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send(JSON.stringify({ id: 'evt_123' }));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ received: true });
      });
    });
  });
});
