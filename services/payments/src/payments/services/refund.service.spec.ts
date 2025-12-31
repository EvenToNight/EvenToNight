import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RefundService } from './refund.service';
import { StripeService } from './stripe.service';
import { TicketService } from '../../tickets/services/ticket.service';
import { Order } from '../schemas/order.schema';
import { Refund } from '../schemas/refund.schema';
import { Payment } from '../schemas/payment.schema';
import { Ticket } from '../../tickets/schemas/ticket.schema';
import { Model } from 'mongoose';
import type Stripe from 'stripe';

describe('RefundService', () => {
  let service: RefundService;
  let orderModel: Model<Order>;
  let refundModel: Model<Refund>;
  let paymentModel: Model<Payment>;
  let ticketModel: Model<Ticket>;
  let stripeService: StripeService;

  const mockOrderModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockRefundModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockPaymentModel = {
    findOne: jest.fn(),
  };

  const mockTicketModel = {
    updateMany: jest.fn(),
  };

  const mockTicketService = {
    markTicketsAsRefunded: jest.fn(),
  };

  const mockStripeService = {
    createRefund: jest.fn(),
    retrievePaymentIntent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Refund.name),
          useValue: mockRefundModel,
        },
        {
          provide: getModelToken(Payment.name),
          useValue: mockPaymentModel,
        },
        {
          provide: getModelToken(Ticket.name),
          useValue: mockTicketModel,
        },
        {
          provide: TicketService,
          useValue: mockTicketService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<RefundService>(RefundService);
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
    refundModel = module.get<Model<Refund>>(getModelToken(Refund.name));
    paymentModel = module.get<Model<Payment>>(getModelToken(Payment.name));
    ticketModel = module.get<Model<Ticket>>(getModelToken(Ticket.name));
    stripeService = module.get<StripeService>(StripeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processEventCancellationRefunds', () => {
    it('should process refunds for all completed orders of cancelled event', async () => {
      const eventId = 'event_123';
      const reason = 'Venue unavailable';

      const mockOrders = [
        {
          _id: 'order_1',
          orderNumber: 'ORD-001',
          userId: 'user_1',
          eventId: 'event_123',
          totalAmount: 10000,
          refundedAmount: 0,
          status: 'completed',
          paymentIntentId: 'pi_1',
        },
        {
          _id: 'order_2',
          orderNumber: 'ORD-002',
          userId: 'user_2',
          eventId: 'event_123',
          totalAmount: 15000,
          refundedAmount: 0,
          status: 'completed',
          paymentIntentId: 'pi_2',
        },
      ];

      const mockStripeRefunds = [
        {
          id: 're_1',
          amount: 10000,
          status: 'succeeded',
        } as Stripe.Refund,
        {
          id: 're_2',
          amount: 15000,
          status: 'succeeded',
        } as Stripe.Refund,
      ];

      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });

      mockOrderModel.findById
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockOrders[0])
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockOrders[1])
        });

      mockStripeService.createRefund
        .mockResolvedValueOnce(mockStripeRefunds[0])
        .mockResolvedValueOnce(mockStripeRefunds[1]);

      mockRefundModel.create.mockImplementation((data) => Promise.resolve(data));
      mockOrderModel.findByIdAndUpdate.mockResolvedValue({});
      mockTicketService.markTicketsAsRefunded.mockResolvedValue({});

      await service.processEventCancellationRefunds(eventId, reason);

      expect(orderModel.find).toHaveBeenCalledWith({
        eventId,
        status: { $in: ['completed', 'partially_refunded'] },
      });

      // Should call processRefund internally for each order
      expect(stripeService.createRefund).toHaveBeenCalledTimes(2);
    });

    it('should return nothing if no orders found', async () => {
      const eventId = 'event_no_orders';
      const reason = 'Event cancelled';

      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.processEventCancellationRefunds(eventId, reason);

      expect(stripeService.createRefund).not.toHaveBeenCalled();
    });
  });
});
