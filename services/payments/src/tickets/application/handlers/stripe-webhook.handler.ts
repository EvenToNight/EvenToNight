import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebhookEvent } from '../../domain/types/payment-service.types';
import { CheckoutSessionExpiredHandler } from './checkout-session-expired.handler';
import { CheckoutSessionCompletedHandler } from './checkout-session-completed.handler';
import { InboxService as IdempotencyService } from '@libs/nestjs-common';
import {
  TRANSACTION_MANAGER,
  Transactional,
  TransactionManager,
} from '@libs/ts-common';

@Injectable()
export class StripeWebhookHandler {
  private readonly logger = new Logger(StripeWebhookHandler.name);

  constructor(
    private readonly checkoutCompletedHandler: CheckoutSessionCompletedHandler,
    private readonly checkoutExpiredHandler: CheckoutSessionExpiredHandler,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  // https://docs.stripe.com/testing - check card number for testing
  // [COMPLETED] payment_intent.succeeded - payment_intent.created - checkout.session.completed - mandate.updated - charge.succeeded - charge.updated
  // [FAILED] payment_intent.payment_failed - charge.failed
  // [EXPIRED] payment_intent.canceled - checkout.session.expired
  @Transactional()
  async handle(event: WebhookEvent): Promise<{ received: boolean }> {
    const key = `stripe:${event.webhookEventId}`;
    if (await this.idempotencyService.isProcessed(key)) {
      this.logger.log(
        `Duplicate webhook event ignored: ${event.webhookEventId}`,
      );
      return { received: true };
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.checkoutCompletedHandler.handle(
          event.sessionId,
          event.orderId,
          event.paymentIntentId,
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
        return { received: false };
    }

    await this.idempotencyService.markAsProcessed(key);
    return { received: true };
  }
}
