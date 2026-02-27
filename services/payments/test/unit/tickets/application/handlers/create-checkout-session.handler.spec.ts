process.env.NODE_ENV = 'development';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCheckoutSessionHandler } from 'src/tickets/application/handlers/create-checkout-session.handler';
import { EventTicketTypeService } from 'src/tickets/application/services/event-ticket-type.service';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { OrderService } from 'src/tickets/application/services/order.service';
import { EventService } from 'src/tickets/application/services/event.service';
import { UserService } from 'src/tickets/application/services/user.service';
import { CheckoutSessionExpiredHandler } from 'src/tickets/application/handlers/checkout-session-expired.handler';
import { CheckoutSessionCompletedHandler } from 'src/tickets/application/handlers/checkout-session-completed.handler';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { TRANSACTION_MANAGER } from '@libs/ts-common';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { Order } from 'src/tickets/domain/aggregates/order.aggregate';
import { TicketId } from 'src/tickets/domain/value-objects/ticket-id.vo';
import { CreateCheckoutSessionDto } from 'src/tickets/application/dto/create-checkout-session.dto';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { EventTicketTypeNotFoundException } from 'src/tickets/domain/exceptions/event-ticket-type-not-found.exception';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';

describe('CreateCheckoutSessionHandler', () => {
  const fakeEventId = 'event-1';
  const fakeUserId = 'user-1';

  const fakeTicketType = EventTicketType.create({
    eventId: EventId.fromString(fakeEventId),
    type: TicketType.fromString('STANDARD'),
    price: Money.fromAmount(50, 'USD'),
    availableQuantity: 100,
    soldQuantity: 0,
  });

  const fakeSavedTicket = Ticket.createPending({
    eventId: EventId.fromString(fakeEventId),
    userId: UserId.fromString(fakeUserId),
    attendeeName: 'Test Attendee',
    ticketTypeId: fakeTicketType.getId(),
    price: Money.fromAmount(50, 'USD'),
  });

  const fakeOrder = Order.createPending({
    userId: UserId.fromString(fakeUserId),
    eventId: EventId.fromString(fakeEventId),
    ticketIds: [TicketId.fromString(fakeSavedTicket.getId().toString())],
  });

  const fakeLineItemsMap = new Map([
    [
      fakeTicketType.getId().toString(),
      { ticketType: fakeTicketType, count: 1, tickets: [fakeSavedTicket] },
    ],
  ]);

  const fakeDto: CreateCheckoutSessionDto = {
    userId: fakeUserId,
    items: [
      {
        ticketTypeId: fakeTicketType.getId().toString(),
        attendeeName: 'Test Attendee',
      },
    ],
    successUrl: 'http://success',
    cancelUrl: 'http://cancel',
  };

  const fakeEvent = Event.create({
    id: EventId.fromString(fakeEventId),
    creatorId: UserId.fromString('creator-1'),
    status: EventStatus.PUBLISHED,
    date: new Date(),
  });

  function buildMocks() {
    return {
      eventTicketTypeService: { findById: jest.fn(), update: jest.fn() },
      ticketService: { save: jest.fn() },
      orderService: { createOrder: jest.fn().mockResolvedValue(fakeOrder) },
      eventService: { findById: jest.fn().mockResolvedValue(fakeEvent) },
      userService: { getUserLanguage: jest.fn().mockResolvedValue('en') },
      checkoutSessionExpiredHandler: {
        handle: jest.fn().mockResolvedValue(undefined),
      },
      checkoutCompletedHandler: {
        handle: jest.fn().mockResolvedValue(undefined),
      },
      paymentService: { createCheckoutSessionWithItems: jest.fn() },
      transactionManager: {
        executeInTransaction: jest
          .fn()
          .mockImplementation((fn: () => unknown) => fn()),
      },
    };
  }

  async function buildHandler(
    mocks: ReturnType<typeof buildMocks>,
  ): Promise<CreateCheckoutSessionHandler> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCheckoutSessionHandler,
        {
          provide: TRANSACTION_MANAGER,
          useValue: mocks.transactionManager,
        },
        { provide: PAYMENT_SERVICE, useValue: mocks.paymentService },
        {
          provide: EventTicketTypeService,
          useValue: mocks.eventTicketTypeService,
        },
        { provide: TicketService, useValue: mocks.ticketService },
        { provide: OrderService, useValue: mocks.orderService },
        { provide: EventService, useValue: mocks.eventService },
        { provide: UserService, useValue: mocks.userService },
        {
          provide: CheckoutSessionExpiredHandler,
          useValue: mocks.checkoutSessionExpiredHandler,
        },
        {
          provide: CheckoutSessionCompletedHandler,
          useValue: mocks.checkoutCompletedHandler,
        },
      ],
    }).compile();
    return module.get(CreateCheckoutSessionHandler);
  }

  describe('Given groupTicketsByType is called with a ticket whose ticketTypeId is not in ticketTypes', () => {
    let handler: CreateCheckoutSessionHandler;

    beforeEach(async () => {
      handler = await buildHandler(buildMocks());
    });

    it('throws EventTicketTypeNotFoundException (covers line 152)', () => {
      const orphanTicket = Ticket.createPending({
        eventId: EventId.fromString(fakeEventId),
        userId: UserId.fromString(fakeUserId),
        attendeeName: 'Orphan',
        ticketTypeId: EventTicketTypeId.fromString('orphan-type-id'),
        price: Money.fromAmount(50, 'USD'),
      });

      expect(() =>
        (handler as any).groupTicketsByType([orphanTicket], [fakeTicketType]),
      ).toThrow(EventTicketTypeNotFoundException);
    });
  });

  describe('Given TEST_DEPLOYMENT=true (isTest mode - auto-completes checkout immediately)', () => {
    let handler: CreateCheckoutSessionHandler;
    let mocks: ReturnType<typeof buildMocks>;

    beforeEach(async () => {
      mocks = buildMocks();
      process.env.TEST_DEPLOYMENT = 'true';
      handler = await buildHandler(mocks);
      delete process.env.TEST_DEPLOYMENT;
    });

    it('calls checkoutCompletedHandler.handle and returns the dev mock session (covers line 211)', async () => {
      jest
        .spyOn(handler as any, 'reserveTicketsAndCreateOrder')
        .mockResolvedValue({
          lineItemsMap: fakeLineItemsMap,
          order: fakeOrder,
        });

      const result = await handler.handle(fakeDto);

      expect(mocks.checkoutCompletedHandler.handle).toHaveBeenCalledWith(
        'cs_test_dev_session',
        fakeOrder.getId().toString(),
        'pi_test_dev_payment_intent',
      );
      expect(result).toMatchObject({
        sessionId: 'cs_test_dev_session',
        redirectUrl: fakeDto.successUrl,
        orderId: fakeOrder.getId().toString(),
      });
    });
  });

  describe('Given production mode (NODE_ENV=production, TEST_DEPLOYMENT not set)', () => {
    let handler: CreateCheckoutSessionHandler;
    let mocks: ReturnType<typeof buildMocks>;

    beforeEach(async () => {
      mocks = buildMocks();
      process.env.NODE_ENV = 'production';
      handler = await buildHandler(mocks);
      process.env.NODE_ENV = 'development';
    });

    describe('When paymentService.createCheckoutSessionWithItems succeeds', () => {
      it('calls createCheckoutSessionWithItems and returns session details (covers lines 226-244)', async () => {
        jest
          .spyOn(handler as any, 'reserveTicketsAndCreateOrder')
          .mockResolvedValue({
            lineItemsMap: fakeLineItemsMap,
            order: fakeOrder,
          });

        const fakeSession = {
          id: 'cs_prod_session',
          redirectUrl: 'https://stripe.com/pay',
          expiresAt: Date.now() + 3600,
          orderId: fakeOrder.getId().toString(),
        };
        mocks.paymentService.createCheckoutSessionWithItems.mockResolvedValue(
          fakeSession,
        );

        const result = await handler.handle(fakeDto);

        expect(
          mocks.paymentService.createCheckoutSessionWithItems,
        ).toHaveBeenCalled();
        expect(result).toMatchObject({
          sessionId: 'cs_prod_session',
          redirectUrl: 'https://stripe.com/pay',
          orderId: fakeOrder.getId().toString(),
        });
      });
    });

    describe('When paymentService.createCheckoutSessionWithItems throws', () => {
      it('calls checkoutSessionExpiredHandler.handle and rethrows the error (covers lines 245-251)', async () => {
        jest
          .spyOn(handler as any, 'reserveTicketsAndCreateOrder')
          .mockResolvedValue({
            lineItemsMap: fakeLineItemsMap,
            order: fakeOrder,
          });

        const paymentError = new Error('Payment service unavailable');
        mocks.paymentService.createCheckoutSessionWithItems.mockRejectedValue(
          paymentError,
        );

        await expect(handler.handle(fakeDto)).rejects.toThrow(
          'Payment service unavailable',
        );

        expect(mocks.checkoutSessionExpiredHandler.handle).toHaveBeenCalledWith(
          'NO_SESSION_CREATED',
          fakeOrder.getId().toString(),
          'Failed to create checkout session',
        );
      });
    });
  });
});
