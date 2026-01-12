import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from '../../infrastructure/stripe/stripe.service';
import { Stripe } from 'stripe';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new Error('Missing raw body');
    }

    try {
      // Verify and construct the event
      const event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
      );

      this.logger.log(`Received Stripe webhook: ${event.type}`);
      const session = event.data.object as Stripe.Checkout.Session;
      await this.stripeService.expireCheckoutSession(session.id);
      // https://docs.stripe.com/testing - check card numeber for testing
      // payment_intent.succeeded - payment_intent.created - checkout.session.completed - mandate.updated - charge.succeeded - charge.updated
      // payment_intent.payment_failed - charge.failed
      // payment_intent.canceled - checkout.session.expired

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing failed', error);
      throw error;
    }
  }
}
