import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';

// Mock Stripe at the module level
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      cancel: jest.fn(),
      retrieve: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('StripeService', () => {
  let service: StripeService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          STRIPE_SECRET_KEY: 'sk_test_mock_key_12345',
          STRIPE_WEBHOOK_SECRET: 'whsec_mock_secret',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent with correct parameters', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock_123',
        client_secret: 'pi_mock_123_secret',
        amount: 10000,
        currency: 'eur',
      };

      service['stripe'].paymentIntents.create = jest.fn().mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(10000, 'eur', {
        reservationId: 'res_123',
        eventId: 'event_456',
      });

      expect(result).toEqual(mockPaymentIntent);
      expect(service['stripe'].paymentIntents.create).toHaveBeenCalledWith({
        amount: 10000,
        currency: 'eur',
        metadata: {
          reservationId: 'res_123',
          eventId: 'event_456',
        },
        automatic_payment_methods: {
          enabled: true,
        },
        capture_method: 'automatic',
      });
    });

    it('should handle large amounts correctly', async () => {
      const mockPaymentIntent = { id: 'pi_large', amount: 999999 };

      service['stripe'].paymentIntents.create = jest.fn().mockResolvedValue(mockPaymentIntent);

      await service.createPaymentIntent(999999, 'eur', { reservationId: 'res_1' });

      expect(service['stripe'].paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 999999 }),
      );
    });

    it('should handle Stripe API errors', async () => {
      service['stripe'].paymentIntents.create = jest.fn().mockRejectedValue(
        new Error('Stripe API error: Invalid amount'),
      );

      await expect(
        service.createPaymentIntent(10000, 'eur', { reservationId: 'res_1' }),
      ).rejects.toThrow('Stripe API error');
    });
  });

  describe('cancelPaymentIntent', () => {
    it('should cancel a payment intent', async () => {
      const mockCancelledIntent = {
        id: 'pi_mock_123',
        status: 'canceled',
      };

      service['stripe'].paymentIntents.cancel = jest.fn().mockResolvedValue(mockCancelledIntent);

      const result = await service.cancelPaymentIntent('pi_mock_123');

      expect(result).toEqual(mockCancelledIntent);
      expect(service['stripe'].paymentIntents.cancel).toHaveBeenCalledWith('pi_mock_123');
    });
  });

  describe('createRefund', () => {
    it('should create a full refund', async () => {
      const mockRefund = {
        id: 're_mock_123',
        amount: 10000,
        status: 'succeeded',
      };

      service['stripe'].refunds.create = jest.fn().mockResolvedValue(mockRefund);

      const result = await service.createRefund('pi_mock_123', 10000, 'duplicate' as any);

      expect(result).toEqual(mockRefund);
      expect(service['stripe'].refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_mock_123',
        amount: 10000,
        reason: 'duplicate',
      });
    });

    it('should create partial refund', async () => {
      const mockRefund = {
        id: 're_mock_456',
        amount: 5000,
        status: 'succeeded',
      };

      service['stripe'].refunds.create = jest.fn().mockResolvedValue(mockRefund);

      await service.createRefund('pi_mock_123', 5000, 'requested_by_customer' as any);

      expect(service['stripe'].refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_mock_123',
        amount: 5000,
        reason: 'requested_by_customer',
      });
    });

    it('should create refund without specifying amount (full refund)', async () => {
      const mockRefund = { id: 're_full', status: 'succeeded' };

      service['stripe'].refunds.create = jest.fn().mockResolvedValue(mockRefund);

      await service.createRefund('pi_mock_123');

      expect(service['stripe'].refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_mock_123',
        amount: undefined,
        reason: undefined,
      });
    });

    it('should handle refund failures', async () => {
      service['stripe'].refunds.create = jest.fn().mockRejectedValue(
        new Error('Charge already refunded'),
      );

      await expect(service.createRefund('pi_mock_123', 10000)).rejects.toThrow(
        'Charge already refunded',
      );
    });
  });

  describe('constructWebhookEvent', () => {
    it('should verify webhook signature and return event', async () => {
      const mockEvent = {
        id: 'evt_mock_123',
        type: 'payment_intent.succeeded',
      };

      const payload = Buffer.from(JSON.stringify(mockEvent));
      const signature = 'mock_signature';

      service['stripe'].webhooks.constructEvent = jest.fn().mockReturnValue(mockEvent);

      const result = await service.constructWebhookEvent(payload, signature);

      expect(result).toEqual(mockEvent);
      expect(service['stripe'].webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_mock_secret',
      );
    });

    it('should handle payment_intent.succeeded webhook', async () => {
      const mockEvent = {
        id: 'evt_succeeded',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      service['stripe'].webhooks.constructEvent = jest.fn().mockReturnValue(mockEvent);

      const result = await service.constructWebhookEvent(Buffer.from('{}'), 'sig');

      expect(result.type).toBe('payment_intent.succeeded');
    });

    it('should handle payment_intent.payment_failed webhook', async () => {
      const mockEvent = {
        id: 'evt_failed',
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_123' } },
      };

      service['stripe'].webhooks.constructEvent = jest.fn().mockReturnValue(mockEvent);

      const result = await service.constructWebhookEvent(Buffer.from('{}'), 'sig');

      expect(result.type).toBe('payment_intent.payment_failed');
    });

    it('should throw error when signature verification fails', async () => {
      const payload = Buffer.from('{}');
      const signature = 'invalid_signature';

      service['stripe'].webhooks.constructEvent = jest.fn().mockImplementation(() => {
        throw new Error('Signature verification failed');
      });

      await expect(service.constructWebhookEvent(payload, signature)).rejects.toThrow(
        'Signature verification failed',
      );
    });

  });

  describe('getPaymentIntent', () => {
    it('should retrieve payment intent by id', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock_123',
        status: 'succeeded',
        amount: 10000,
      };

      service['stripe'].paymentIntents.retrieve = jest.fn().mockResolvedValue(mockPaymentIntent);

      const result = await service.getPaymentIntent('pi_mock_123');

      expect(result).toEqual(mockPaymentIntent);
      expect(service['stripe'].paymentIntents.retrieve).toHaveBeenCalledWith('pi_mock_123');
    });
  });
});
