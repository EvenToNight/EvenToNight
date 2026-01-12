import { Module } from '@nestjs/common';

// Infrastructure
import { StripeService } from './infrastructure/stripe/stripe.service';

// Presentation
import { StripeWebhookController } from './presentation/controllers/stripe-webhook.controller';
import { CheckoutCancelController } from './presentation/controllers/checkout-cancel.controller';

@Module({
  controllers: [StripeWebhookController, CheckoutCancelController],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {}
