import {
  CheckoutSession,
  CreateCheckoutSessionParams,
  WebhookEvent,
} from '../types/payment-service.types';

export interface PaymentService {
  createCheckoutSessionWithItems(
    params: CreateCheckoutSessionParams,
  ): Promise<CheckoutSession>;

  getCheckoutSession(sessionId: string): Promise<CheckoutSession>;

  expireCheckoutSession(sessionId: string): Promise<CheckoutSession>;

  constructWebhookEvent(
    payload: string | Buffer<ArrayBufferLike>,
    signature: string,
  ): WebhookEvent;
}

export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');
