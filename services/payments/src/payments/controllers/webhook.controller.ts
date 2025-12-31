import {
  Controller,
  Post,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { StripeWebhookGuard } from '../../common/guards/stripe-webhook.guard';
import { CheckoutService } from '../services/checkout.service';

@Controller('webhooks/stripe')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private checkoutService: CheckoutService) {}

  /**
   * Handle Stripe webhook events
   * CRITICAL: Must verify signature via StripeWebhookGuard
   */
  @Post()
  @UseGuards(StripeWebhookGuard)
  async handleWebhook(@Req() req: RawBodyRequest<Request & { stripeEvent: Stripe.Event }>) {
    const event = req.stripeEvent;

    this.logger.log(`Received webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.checkoutService.handlePaymentSuccess(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case 'payment_intent.payment_failed':
          await this.checkoutService.handlePaymentFailure(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case 'charge.refunded':
          // TODO: Handle refund success
          this.logger.log(`Charge refunded: ${event.data.object.id}`);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      // Always return 200 to Stripe (even if processing fails internally)
      return { received: true };
    } catch (error) {
      this.logger.error(
        `Error processing webhook ${event.type}: ${error.message}`,
        error.stack,
      );

      // Still return 200 to prevent Stripe from retrying
      // Failed events should be logged and handled manually
      return { received: true, error: error.message };
    }
  }
}
