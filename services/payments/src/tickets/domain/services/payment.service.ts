import { CreateCheckoutSessionParams } from '../types/payment-service.types';
export interface PaymentService<S, E> {
  createCheckoutSessionWithItems(
    params: CreateCheckoutSessionParams,
  ): Promise<S>;

  getCheckoutSession(sessionId: string): Promise<S>;

  expireCheckoutSession(sessionId: string): Promise<S>;

  constructWebhookEvent(
    payload: string | Buffer<ArrayBufferLike>,
    signature: string,
  ): E;
}
