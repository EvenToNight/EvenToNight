import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Stripe } from 'stripe';
import { EventPublisher } from '../../../commons/intrastructure/messaging/event-publisher';
import { CheckoutSessionCompletedEvent } from '../../domain/events/checkout-session-completed.event';
import { CheckoutSessionExpiredEvent } from '../../domain/events/checkout-session-expired.event';
import {
  PAYMENT_SERVICE,
  type PaymentService,
} from 'src/tickets/domain/services/payment.service.interface';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: PaymentService<Stripe.Event>,
    private readonly eventPublisher: EventPublisher,
  ) {}

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
      const event = this.paymentService.constructWebhookEvent(
        rawBody,
        signature,
      );

      this.logger.log(`Received Stripe webhook: ${event.type}`);
      // https://docs.stripe.com/testing - check card numeber for testing
      // [COMPLETED] payment_intent.succeeded - payment_intent.created - checkout.session.completed - mandate.updated - charge.succeeded - charge.updated
      // [FAILED] payment_intent.payment_failed - charge.failed
      // [EXPIRED] payment_intent.canceled - checkout.session.expired

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
    } catch (error) {
      this.logger.error('Webhook processing failed', error);
      throw error;
    }
  }

  /**
   * Handle Checkout Session completed (Saga Phase 2)
   * User completed payment on Stripe hosted page
   *
   * Publishes CheckoutSessionCompletedEvent to be handled by the tickets module
   */
  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const ticketIdsJson = session.metadata!.ticketIds;
    const userId = session.metadata!.userId;

    try {
      const ticketIds: string[] = JSON.parse(ticketIdsJson) as string[];

      await this.eventPublisher.publish(
        new CheckoutSessionCompletedEvent({
          sessionId: session.id,
          ticketIds,
          userId: userId,
          totalAmount: session.amount_total!,
          currency: session.currency!.toUpperCase(),
        }),
      );

      this.logger.log(
        `Checkout session completed event published for session ${session.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish checkout session completed event`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle Checkout Session expired (Saga Compensation)
   * User didn't complete payment within 30 minutes
   *
   * Publishes CheckoutSessionExpiredEvent to be handled by the tickets module
   */
  private async handleCheckoutSessionExpired(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const ticketIdsJson = session.metadata!.ticketIds;
    const userId = session.metadata!.userId;

    try {
      const ticketIds: string[] = JSON.parse(ticketIdsJson) as string[];

      await this.eventPublisher.publish(
        new CheckoutSessionExpiredEvent({
          sessionId: session.id,
          ticketIds,
          userId: userId,
          expirationReason: 'Session timeout - user did not complete payment',
        }),
      );

      this.logger.log(
        `Checkout session expired event published for session ${session.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish expired checkout session event`,
        error,
      );
    }
  }
}
