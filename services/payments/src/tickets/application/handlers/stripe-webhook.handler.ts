import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher } from '../../../commons/intrastructure/messaging/event-publisher';
import { CheckoutSessionCompletedEvent } from '../../domain/events/checkout-session-completed.event';
import { CheckoutSessionExpiredEvent } from '../../domain/events/checkout-session-expired.event';
import { WebhookEvent } from '../../domain/types/payment-service.types';

@Injectable()
export class StripeWebhookHandler {
  private readonly logger = new Logger(StripeWebhookHandler.name);

  constructor(private readonly eventPublisher: EventPublisher) {}

  // https://docs.stripe.com/testing - check card number for testing
  // [COMPLETED] payment_intent.succeeded - payment_intent.created - checkout.session.completed - mandate.updated - charge.succeeded - charge.updated
  // [FAILED] payment_intent.payment_failed - charge.failed
  // [EXPIRED] payment_intent.canceled - checkout.session.expired
  async handle(event: WebhookEvent): Promise<{ received: true }> {
    this.logger.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event);
        break;

      case 'checkout.session.expired':
        await this.handleCheckoutSessionExpired(event);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(event: WebhookEvent) {
    await this.eventPublisher.publish(
      new CheckoutSessionCompletedEvent({
        sessionId: event.sessionId,
        orderId: event.orderId,
      }),
    );

    this.logger.log(
      `Checkout session completed event published for session ${event.sessionId}`,
    );
  }

  private async handleCheckoutSessionExpired(event: WebhookEvent) {
    await this.eventPublisher.publish(
      new CheckoutSessionExpiredEvent({
        sessionId: event.sessionId,
        orderId: event.orderId,
        expirationReason: 'Session timeout - user did not complete payment',
      }),
    );

    this.logger.log(
      `Checkout session expired event published for session ${event.sessionId}`,
    );
  }
}
