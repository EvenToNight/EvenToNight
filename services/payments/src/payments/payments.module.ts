import { Module } from '@nestjs/common';

// Infrastructure
import { StripeService } from './infrastructure/stripe/stripe.service';

// Presentation
import { StripeWebhookController } from './presentation/controllers/stripe-webhook.controller';

@Module({
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {}
