process.env.NODE_ENV = 'development';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  PAYMENT_SERVICE,
  PaymentService,
} from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
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
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { TicketId } from 'src/tickets/domain/value-objects/ticket-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { DomainExceptionFilter } from 'src/tickets/presentation/filters/domain-exception.filter';

describe('StripeWebhookController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let ticketService: TicketService;
  let orderService: OrderService;
  let eventTicketTypeService: EventTicketTypeService;
  let mockPaymentService: jest.Mocked<PaymentService>;

  const userId = 'test-user-id';
  const eventId = 'test-event-id';
  const sessionId = 'test-session-id';

  beforeAll(async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    process.env.MONGO_URI = mongoUri;

    mockPaymentService = {
      createCheckoutSessionWithItems: jest.fn(),
      getCheckoutSession: jest.fn(),
      expireCheckoutSession: jest.fn(),
      constructWebhookEvent: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PAYMENT_SERVICE)
      .useValue(mockPaymentService)
      .overrideProvider(EventPublisher)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        publish: jest.fn(),
      })
      .overrideProvider(OutboxRelayService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication({
      rawBody: true,
    });
    app.useLogger(false);
    app.useGlobalFilters(new DomainExceptionFilter());
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
      it('Then returns 400 Bad Request', async () => {
        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .send({ some: 'data' })
          .expect(400);

        expect((res.body as { message: string }).message).toBe(
          'Missing stripe-signature header',
        );
      });
    });

    describe('Given invalid signature', () => {
      it('Then returns 400 Bad Request', async () => {
        mockPaymentService.constructWebhookEvent.mockImplementation(() => {
          throw new Error('Invalid signature');
        });

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'invalid_sig')
          .send({ some: 'data' })
          .expect(400);

        expect((res.body as { message: string }).message).toBe(
          'Webhook processing failed',
        );
      });
    });

    describe('Given a valid event', () => {
      let order: Order;
      let ticket1Id: string;
      let ticket2Id: string;
      let ticketTypeId: string;
      const availableQuantity = 100;
      const soldQuantity = 50;

      beforeEach(async () => {
        const ticketType = await eventTicketTypeService.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('STANDARD'),
          description: 'Standard ticket',
          price: Money.fromAmount(50, 'USD'),
          availableQuantity: availableQuantity,
          soldQuantity: soldQuantity,
        });
        ticketTypeId = ticketType.getId().toString();

        const ticket1 = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'John Doe',
          ticketTypeId: EventTicketTypeId.fromString(ticketTypeId),
          price: Money.fromAmount(50, 'USD'),
        });
        ticket1Id = ticket1.getId().toString();

        const ticket2 = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Jane Doe',
          ticketTypeId: EventTicketTypeId.fromString(ticketTypeId),
          price: Money.fromAmount(50, 'USD'),
        });
        ticket2Id = ticket2.getId().toString();

        order = Order.createPending({
          userId: UserId.fromString(userId),
          eventId: EventId.fromString(eventId),
          ticketIds: [
            TicketId.fromString(ticket1Id),
            TicketId.fromString(ticket2Id),
          ],
        });
        await orderService.save(order);
      });
      describe("When the event is 'checkout.session.completed'", () => {
        it('Then returns 200 and confirms tickets', async () => {
          const webhookEvent: WebhookEvent = {
            webhookEventId: 'evt_completed_001',
            sessionId,
            type: 'checkout.session.completed',
            orderId: order.getId().toString(),
            paymentIntentId: 'pi_test_123',
          };

          mockPaymentService.constructWebhookEvent.mockReturnValue(
            webhookEvent,
          );

          const res = await request(app.getHttpServer())
            .post('/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({ session: 'data' })
            .expect(200);

          expect(res.body).toEqual({ received: true });

          const updatedOrder = await orderService.findById(
            order.getId().toString(),
          );
          expect(updatedOrder?.isCompleted()).toBe(true);
          const updatedTicket1 = await ticketService.findById(ticket1Id);
          expect(updatedTicket1?.isActive()).toBe(true);
          const updatedTicket2 = await ticketService.findById(ticket2Id);
          expect(updatedTicket2?.isActive()).toBe(true);
        });
      });

      describe('When the same event is received twice (duplicate)', () => {
        it('Then returns 200 on both calls but processes only once', async () => {
          const webhookEvent: WebhookEvent = {
            webhookEventId: 'evt_duplicate_001',
            sessionId,
            type: 'checkout.session.completed',
            orderId: order.getId().toString(),
            paymentIntentId: 'pi_test_123',
          };

          mockPaymentService.constructWebhookEvent.mockReturnValue(
            webhookEvent,
          );

          await request(app.getHttpServer())
            .post('/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({ session: 'data' })
            .expect(200);

          const res = await request(app.getHttpServer())
            .post('/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({ session: 'data' })
            .expect(200);

          expect(res.body).toEqual({ received: true });
          expect(
            mockPaymentService.constructWebhookEvent.mock.calls,
          ).toHaveLength(2);
          // Handler for checkout.session.completed was called only once (on first delivery)
          const updatedOrder = await orderService.findById(
            order.getId().toString(),
          );
          expect(updatedOrder?.isCompleted()).toBe(true);
        });
      });

      describe("When the event is 'checkout.session.expired'", () => {
        it('Then returns 200 and cancels order, releases inventory', async () => {
          const webhookEvent: WebhookEvent = {
            webhookEventId: 'evt_expired_001',
            sessionId,
            type: 'checkout.session.expired',
            orderId: order.getId().toString(),
            paymentIntentId: 'pi_test_123',
          };

          mockPaymentService.constructWebhookEvent.mockReturnValue(
            webhookEvent,
          );

          const res = await request(app.getHttpServer())
            .post('/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({ session: 'data' })
            .expect(200);

          expect(res.body).toEqual({ received: true });

          const updatedOrder = await orderService.findById(
            order.getId().toString(),
          );
          expect(updatedOrder?.isCancelled()).toBe(true);
          const updatedTicket1 = await ticketService.findById(ticket1Id);
          expect(updatedTicket1?.isPaymentFailed()).toBe(true);
          const updatedTicket2 = await ticketService.findById(ticket2Id);
          expect(updatedTicket2?.isPaymentFailed()).toBe(true);
          const updatedTicketType =
            await eventTicketTypeService.findById(ticketTypeId);
          expect(updatedTicketType?.getAvailableQuantity()).toBe(
            availableQuantity + 2,
          );
          expect(updatedTicketType?.getSoldQuantity()).toBe(soldQuantity - 2);
        });
      });

      describe('Given an unhandled event type', () => {
        it('Then returns 200 with received: true (logs but does not fail)', async () => {
          const webhookEvent: WebhookEvent = {
            webhookEventId: 'evt_unhandled_001',
            sessionId,
            type: 'payment_intent.succeeded',
            orderId: order.getId().toString(),
            paymentIntentId: 'pi_test_123',
          };

          mockPaymentService.constructWebhookEvent.mockReturnValue(
            webhookEvent,
          );

          const res = await request(app.getHttpServer())
            .post('/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({ session: 'data' })
            .expect(200);

          expect(res.body).toEqual({ received: false });
        });
      });
    });

    describe('Given the orderId in the webhook does not exist', () => {
      describe("When the event is 'checkout.session.completed'", () => {
        it('Then returns 404 Not Found (covers OrderNotFoundException path)', async () => {
          const webhookEvent: WebhookEvent = {
            webhookEventId: 'evt_completed_no_order_001',
            sessionId,
            type: 'checkout.session.completed',
            orderId: 'non-existent-order-id',
            paymentIntentId: 'pi_test_123',
          };

          mockPaymentService.constructWebhookEvent.mockReturnValue(
            webhookEvent,
          );

          await request(app.getHttpServer())
            .post('/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({ session: 'data' })
            .expect(404);
        });
      });

      describe("When the event is 'checkout.session.expired'", () => {
        it('Then returns 404 Not Found (covers OrderNotFoundException path)', async () => {
          const webhookEvent: WebhookEvent = {
            webhookEventId: 'evt_expired_no_order_001',
            sessionId,
            type: 'checkout.session.expired',
            orderId: 'non-existent-order-id',
            paymentIntentId: 'pi_test_123',
          };

          mockPaymentService.constructWebhookEvent.mockReturnValue(
            webhookEvent,
          );

          await request(app.getHttpServer())
            .post('/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send({ session: 'data' })
            .expect(404);
        });
      });
    });

    describe('Given the order has ticket IDs that do not exist in the database', () => {
      it("Then 'checkout.session.completed' returns 200 and completes the order (tickets are skipped)", async () => {
        const order = Order.createPending({
          userId: UserId.fromString(userId),
          eventId: EventId.fromString(eventId),
          ticketIds: [
            TicketId.fromString('fake-ticket-id-that-does-not-exist'),
          ],
        });
        await orderService.save(order);

        const webhookEvent: WebhookEvent = {
          webhookEventId: 'evt_completed_no_ticket_001',
          sessionId,
          type: 'checkout.session.completed',
          orderId: order.getId().toString(),
          paymentIntentId: 'pi_test_123',
        };

        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send({ session: 'data' })
          .expect(200);

        expect(res.body).toEqual({ received: true });
        const updatedOrder = await orderService.findById(
          order.getId().toString(),
        );
        expect(updatedOrder?.isCompleted()).toBe(true);
      });
    });

    describe('Given the order has a ticket that is not in PENDING_PAYMENT status', () => {
      it("Then 'checkout.session.completed' returns 200 and completes the order (non-pending ticket is skipped)", async () => {
        const activeTicket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Already Active',
          ticketTypeId: EventTicketTypeId.fromString('ticket-type-id'),
          price: Money.fromAmount(50, 'USD'),
          status: TicketStatus.ACTIVE,
        });

        const order = Order.createPending({
          userId: UserId.fromString(userId),
          eventId: EventId.fromString(eventId),
          ticketIds: [TicketId.fromString(activeTicket.getId().toString())],
        });
        await orderService.save(order);

        const webhookEvent: WebhookEvent = {
          webhookEventId: 'evt_completed_not_pending_001',
          sessionId,
          type: 'checkout.session.completed',
          orderId: order.getId().toString(),
          paymentIntentId: 'pi_test_123',
        };

        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send({ session: 'data' })
          .expect(200);

        expect(res.body).toEqual({ received: true });
        // The ticket must NOT have changed status
        const unchangedTicket = await ticketService.findById(
          activeTicket.getId().toString(),
        );
        expect(unchangedTicket?.isActive()).toBe(true);
      });
    });

    describe('Given ticketService.update throws during confirmTicketPaymentAndPublish', () => {
      it("Then 'checkout.session.completed' returns 400 (covers catch block in handle)", async () => {
        const ticketType = await eventTicketTypeService.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('STANDARD'),
          description: 'Standard ticket',
          price: Money.fromAmount(50, 'USD'),
          availableQuantity: 10,
          soldQuantity: 1,
        });

        const ticket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Pending Attendee',
          ticketTypeId: EventTicketTypeId.fromString(
            ticketType.getId().toString(),
          ),
          price: Money.fromAmount(50, 'USD'),
        });

        const order = Order.createPending({
          userId: UserId.fromString(userId),
          eventId: EventId.fromString(eventId),
          ticketIds: [TicketId.fromString(ticket.getId().toString())],
        });
        await orderService.save(order);

        const spy = jest
          .spyOn(ticketService, 'update')
          .mockRejectedValueOnce(new Error('DB failure'));

        const webhookEvent: WebhookEvent = {
          webhookEventId: 'evt_completed_update_error_001',
          sessionId,
          type: 'checkout.session.completed',
          orderId: order.getId().toString(),
          paymentIntentId: 'pi_test_123',
        };

        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send({ session: 'data' })
          .expect(500);

        spy.mockRestore();
      });
    });

    describe('Given ticketService.update throws during cancelTicketPaymentAndPublish', () => {
      it("Then 'checkout.session.expired' returns 500 (covers catch block in handle)", async () => {
        const ticketType = await eventTicketTypeService.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('VIP'),
          description: 'VIP ticket',
          price: Money.fromAmount(100, 'USD'),
          availableQuantity: 10,
          soldQuantity: 1,
        });

        const ticket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Pending Attendee 2',
          ticketTypeId: EventTicketTypeId.fromString(
            ticketType.getId().toString(),
          ),
          price: Money.fromAmount(100, 'USD'),
        });

        const order = Order.createPending({
          userId: UserId.fromString(userId),
          eventId: EventId.fromString(eventId),
          ticketIds: [TicketId.fromString(ticket.getId().toString())],
        });
        await orderService.save(order);

        const spy = jest
          .spyOn(ticketService, 'update')
          .mockRejectedValueOnce(new Error('DB failure'));

        const webhookEvent: WebhookEvent = {
          webhookEventId: 'evt_expired_update_error_001',
          sessionId,
          type: 'checkout.session.expired',
          orderId: order.getId().toString(),
          paymentIntentId: 'pi_test_123',
        };

        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send({ session: 'data' })
          .expect(500);

        spy.mockRestore();
      });
    });

    describe("Given the order has ACTIVE tickets when 'checkout.session.expired' fires (branch 76 false - ticket not pending)", () => {
      it('Then returns 200 and cancels order but does not change the active ticket', async () => {
        const ticketType = await eventTicketTypeService.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('STANDARD'),
          description: 'Standard ticket',
          price: Money.fromAmount(50, 'USD'),
          availableQuantity: 10,
          soldQuantity: 1,
        });

        const activeTicket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Already Active',
          ticketTypeId: EventTicketTypeId.fromString(
            ticketType.getId().toString(),
          ),
          price: Money.fromAmount(50, 'USD'),
          status: TicketStatus.ACTIVE,
        });

        const order = Order.createPending({
          userId: UserId.fromString(userId),
          eventId: EventId.fromString(eventId),
          ticketIds: [TicketId.fromString(activeTicket.getId().toString())],
        });
        await orderService.save(order);

        const webhookEvent: WebhookEvent = {
          webhookEventId: 'evt_expired_active_ticket_001',
          sessionId,
          type: 'checkout.session.expired',
          orderId: order.getId().toString(),
          paymentIntentId: 'pi_test_123',
        };
        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send({ session: 'data' })
          .expect(200);

        expect(res.body).toEqual({ received: true });
        const updatedOrder = await orderService.findById(
          order.getId().toString(),
        );
        expect(updatedOrder?.isCancelled()).toBe(true);
        const unchangedTicket = await ticketService.findById(
          activeTicket.getId().toString(),
        );
        expect(unchangedTicket?.isActive()).toBe(true);
      });
    });

    describe("Given the ticket type was deleted before 'checkout.session.expired' fires (branch 87 false - ticketType null)", () => {
      it('Then returns 200 and cancels the order gracefully (ticketType not found is skipped)', async () => {
        const ticketType = await eventTicketTypeService.create({
          eventId: EventId.fromString(eventId),
          type: TicketType.fromString('VIP'),
          description: 'VIP ticket',
          price: Money.fromAmount(100, 'USD'),
          availableQuantity: 10,
          soldQuantity: 1,
        });

        const pendingTicket = await ticketService.create({
          eventId: EventId.fromString(eventId),
          userId: UserId.fromString(userId),
          attendeeName: 'Pending Attendee',
          ticketTypeId: EventTicketTypeId.fromString(
            ticketType.getId().toString(),
          ),
          price: Money.fromAmount(100, 'USD'),
        });

        const order = Order.createPending({
          userId: UserId.fromString(userId),
          eventId: EventId.fromString(eventId),
          ticketIds: [TicketId.fromString(pendingTicket.getId().toString())],
        });
        await orderService.save(order);

        // Delete the ticket type to simulate it being removed from DB
        await eventTicketTypeService.deleteAll();

        const webhookEvent: WebhookEvent = {
          webhookEventId: 'evt_expired_no_tickettype_001',
          sessionId,
          type: 'checkout.session.expired',
          orderId: order.getId().toString(),
          paymentIntentId: 'pi_test_123',
        };
        mockPaymentService.constructWebhookEvent.mockReturnValue(webhookEvent);

        const res = await request(app.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send({ session: 'data' })
          .expect(200);

        expect(res.body).toEqual({ received: true });
        const updatedOrder = await orderService.findById(
          order.getId().toString(),
        );
        expect(updatedOrder?.isCancelled()).toBe(true);
      });
    });

    describe('Given rawBody is not enabled (app created without rawBody: true)', () => {
      let appNoRawBody: INestApplication<App>;

      beforeAll(async () => {
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

        appNoRawBody = moduleFixture.createNestApplication(); // rawBody: true intentionally omitted
        appNoRawBody.useLogger(false);
        await appNoRawBody.init();
      });

      afterAll(async () => {
        await appNoRawBody.close();
      });

      it('Then returns 400 Missing raw body', async () => {
        const res = await request(appNoRawBody.getHttpServer())
          .post('/webhooks/stripe')
          .set('stripe-signature', 'valid_sig')
          .send({ some: 'data' })
          .expect(400);

        expect((res.body as { message: string }).message).toBe(
          'Missing raw body',
        );
      });
    });
  });
});
