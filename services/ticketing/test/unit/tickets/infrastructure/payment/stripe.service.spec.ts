import { Logger } from '@nestjs/common';
import { Money } from 'src/tickets/domain/value-objects/money.vo';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

const mockCreate = jest.fn();
const mockRetrieve = jest.fn();
const mockExpire = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
        retrieve: mockRetrieve,
        expire: mockExpire,
      },
    },
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));
});

describe('StripeService', () => {
  let StripeService: typeof import('src/tickets/infrastructure/payment/stripe.service').StripeService;

  const SESSION_STUB = {
    id: 'cs_test_123',
    status: 'open',
    metadata: { orderId: 'order-1' },
    expires_at: 9999999999,
    url: 'https://checkout.stripe.com/pay/cs_test_123',
  };

  beforeAll(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
    // Import after env vars are set so the constructor doesn't throw
    ({ StripeService } =
      await import('src/tickets/infrastructure/payment/stripe.service'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('throws when STRIPE_SECRET_KEY is missing', () => {
      const orig = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      expect(() => new StripeService()).toThrow('STRIPE_SECRET_KEY');
      process.env.STRIPE_SECRET_KEY = orig;
    });

    it('throws when STRIPE_WEBHOOK_SECRET is missing', () => {
      const orig = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;
      expect(() => new StripeService()).toThrow('STRIPE_WEBHOOK_SECRET');
      process.env.STRIPE_WEBHOOK_SECRET = orig;
    });
  });

  describe('toMinorUnits', () => {
    it('converts USD amount to cents', () => {
      const service = new StripeService();
      const money = Money.fromAmount(9.99, 'USD');
      expect(service.toMinorUnits(money)).toBe(999);
    });

    it('converts EUR amount to cents', () => {
      const service = new StripeService();
      const money = Money.fromAmount(10, 'EUR');
      expect(service.toMinorUnits(money)).toBe(1000);
    });

    it('falls back to 2 decimal places for unknown currency codes', () => {
      const service = new StripeService();
      // Use a mock Money whose currency is not in the currency-codes library
      const money = {
        getAmount: () => 10,
        getCurrency: () => 'XYZ',
      } as unknown as Money;
      expect(service.toMinorUnits(money)).toBe(1000);
    });
  });

  describe('createCheckoutSessionWithItems', () => {
    it('creates a session and returns mapped CheckoutSession', async () => {
      mockCreate.mockResolvedValue(SESSION_STUB);
      const service = new StripeService();

      const result = await service.createCheckoutSessionWithItems({
        userId: 'user-1',
        orderId: 'order-1',
        ticketIds: ['t-1'],
        ticketTypeIds: [new Set(['tt-1'])],
        eventId: 'ev-1',
        language: 'en',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        lineItems: [
          {
            productName: 'VIP Ticket',
            productDescription: 'Front row',
            price: Money.fromAmount(100, 'USD'),
            quantity: 2,
          },
        ],
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('cs_test_123');
      expect(result.status).toBe('open');
      expect(result.orderId).toBe('order-1');
    });

    it('includes eventTitle in custom_text when provided', async () => {
      mockCreate.mockResolvedValue(SESSION_STUB);
      const service = new StripeService();

      await service.createCheckoutSessionWithItems({
        userId: 'user-1',
        orderId: 'order-1',
        ticketIds: ['t-1'],
        ticketTypeIds: [new Set(['tt-1'])],
        eventId: 'ev-1',
        language: 'it',
        eventTitle: 'Concerto 2025',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        lineItems: [],
      });

      const [firstCall] = mockCreate.mock.calls as Array<
        [Record<string, unknown>]
      >;
      const callArg = firstCall[0];
      expect(
        (callArg.custom_text as { submit: { message: string } }).submit.message,
      ).toContain('Concerto 2025');
    });

    it('omits custom_text when eventTitle is not provided', async () => {
      mockCreate.mockResolvedValue(SESSION_STUB);
      const service = new StripeService();

      await service.createCheckoutSessionWithItems({
        userId: 'user-1',
        orderId: 'order-1',
        ticketIds: ['t-1'],
        ticketTypeIds: [new Set(['tt-1'])],
        eventId: 'ev-1',
        language: 'en',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        lineItems: [],
      });

      const [firstCall] = mockCreate.mock.calls as Array<
        [Record<string, unknown>]
      >;
      const callArg = firstCall[0];
      expect(callArg.custom_text).toBeUndefined();
    });

    it('returns empty orderId when metadata is missing', async () => {
      mockCreate.mockResolvedValue({ ...SESSION_STUB, metadata: null });
      const service = new StripeService();

      const result = await service.createCheckoutSessionWithItems({
        userId: 'user-1',
        orderId: 'order-1',
        ticketIds: ['t-1'],
        ticketTypeIds: [new Set(['tt-1'])],
        eventId: 'ev-1',
        language: 'en',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        lineItems: [],
      });

      expect(result.orderId).toBe('');
    });

    it('rethrows errors from Stripe', async () => {
      mockCreate.mockRejectedValue(new Error('Stripe error'));
      const service = new StripeService();

      await expect(
        service.createCheckoutSessionWithItems({
          userId: 'user-1',
          orderId: 'order-1',
          ticketIds: ['t-1'],
          ticketTypeIds: [new Set(['tt-1'])],
          eventId: 'ev-1',
          language: 'en',
          successUrl: '',
          cancelUrl: '',
          lineItems: [],
        }),
      ).rejects.toThrow('Stripe error');
    });
  });

  describe('getCheckoutSession', () => {
    it('retrieves a session and returns mapped CheckoutSession', async () => {
      mockRetrieve.mockResolvedValue(SESSION_STUB);
      const service = new StripeService();

      const result = await service.getCheckoutSession('cs_test_123');

      expect(mockRetrieve).toHaveBeenCalledWith('cs_test_123');
      expect(result.id).toBe('cs_test_123');
    });

    it('returns empty orderId when metadata is missing', async () => {
      mockRetrieve.mockResolvedValue({ ...SESSION_STUB, metadata: null });
      const service = new StripeService();

      const result = await service.getCheckoutSession('cs_test_123');
      expect(result.orderId).toBe('');
    });

    it('rethrows errors from Stripe', async () => {
      mockRetrieve.mockRejectedValue(new Error('Not found'));
      const service = new StripeService();

      await expect(service.getCheckoutSession('bad-id')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('expireCheckoutSession', () => {
    it('expires a session and returns mapped CheckoutSession', async () => {
      mockExpire.mockResolvedValue({ ...SESSION_STUB, status: 'expired' });
      const service = new StripeService();

      const result = await service.expireCheckoutSession('cs_test_123');

      expect(mockExpire).toHaveBeenCalledWith('cs_test_123');
      expect(result.status).toBe('expired');
    });

    it('returns empty orderId when metadata is missing', async () => {
      mockExpire.mockResolvedValue({
        ...SESSION_STUB,
        metadata: null,
        status: 'expired',
      });
      const service = new StripeService();

      const result = await service.expireCheckoutSession('cs_test_123');
      expect(result.orderId).toBe('');
    });

    it('rethrows errors from Stripe', async () => {
      mockExpire.mockRejectedValue(new Error('Cannot expire'));
      const service = new StripeService();

      await expect(
        service.expireCheckoutSession('cs_test_123'),
      ).rejects.toThrow('Cannot expire');
    });
  });

  describe('constructWebhookEvent', () => {
    it('constructs and returns a WebhookEvent', () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: { id: 'cs_test_123', metadata: { orderId: 'order-1' } },
        },
      });
      const service = new StripeService();

      const result = service.constructWebhookEvent(
        Buffer.from('payload'),
        'sig',
      );

      expect(result.type).toBe('checkout.session.completed');
      expect(result.sessionId).toBe('cs_test_123');
      expect(result.orderId).toBe('order-1');
    });

    it('returns empty orderId when webhook session has no metadata', () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123', metadata: null } },
      });
      const service = new StripeService();

      const result = service.constructWebhookEvent(
        Buffer.from('payload'),
        'sig',
      );
      expect(result.orderId).toBe('');
    });

    it('throws PaymentException when Stripe signature verification fails with Error', () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      const service = new StripeService();

      expect(() =>
        service.constructWebhookEvent(Buffer.from('bad'), 'bad-sig'),
      ).toThrow('Failed to construct webhook event: Invalid signature');
    });

    it('throws PaymentException with "Unknown error" when a non-Error is thrown', () => {
      mockConstructEvent.mockImplementation(() => {
        const nonError: unknown = 'raw string error';
        throw nonError;
      });
      const service = new StripeService();

      expect(() =>
        service.constructWebhookEvent(Buffer.from('bad'), 'bad-sig'),
      ).toThrow('Failed to construct webhook event: Unknown error');
    });
  });
});
