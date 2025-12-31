import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover' as any,
    });

    this.logger.log('Stripe initialized successfully');
  }

  /**
   * Create a Payment Intent for checkout
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: { enabled: true },
        capture_method: 'automatic',
      });

      this.logger.log(
        `Payment Intent created: ${paymentIntent.id} for ${amount} ${currency}`,
      );

      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to create Payment Intent: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retrieve a Payment Intent
   */
  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve Payment Intent ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Confirm a Payment Intent (usually done by frontend, but can be done server-side)
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.confirm(paymentIntentId);

      this.logger.log(`Payment Intent confirmed: ${paymentIntentId}`);

      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to confirm Payment Intent ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Cancel a Payment Intent
   */
  async cancelPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.cancel(paymentIntentId);

      this.logger.log(`Payment Intent cancelled: ${paymentIntentId}`);

      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to cancel Payment Intent ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      });

      this.logger.log(
        `Refund created: ${refund.id} for ${amount || 'full amount'} on ${paymentIntentId}`,
      );

      return refund;
    } catch (error) {
      this.logger.error(
        `Failed to create refund for ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Construct webhook event from raw body and signature
   * CRITICAL for security - verifies webhook authenticity
   */
  async constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      this.logger.log(`Webhook event verified: ${event.type}`);

      return event;
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get Stripe instance for advanced operations
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
