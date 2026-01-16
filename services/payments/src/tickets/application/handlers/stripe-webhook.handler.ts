import { Injectable, Logger } from '@nestjs/common';
import { WebhookEvent } from '../../domain/types/payment-service.types';
import { CheckoutSessionExpiredHandler } from './checkout-session-expired.handler';
import { CheckoutSessionCompletedHandler } from './checkout-session-completed.handler';

@Injectable()
export class StripeWebhookHandler {
  private readonly logger = new Logger(StripeWebhookHandler.name);

  constructor(
    private readonly checkoutCompletedHandler: CheckoutSessionCompletedHandler,
    private readonly checkoutExpiredHandler: CheckoutSessionExpiredHandler,
  ) {}

  // https://docs.stripe.com/testing - check card number for testing
  // [COMPLETED] payment_intent.succeeded - payment_intent.created - checkout.session.completed - mandate.updated - charge.succeeded - charge.updated
  // [FAILED] payment_intent.payment_failed - charge.failed
  // [EXPIRED] payment_intent.canceled - checkout.session.expired
  async handle(event: WebhookEvent): Promise<{ received: true }> {
    this.logger.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.checkoutCompletedHandler.handle(
          event.sessionId,
          event.orderId,
        );
        break;

      case 'checkout.session.expired':
        await this.checkoutExpiredHandler.handle(
          event.sessionId,
          event.orderId,
        );
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
