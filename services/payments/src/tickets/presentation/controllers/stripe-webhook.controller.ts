import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import {
  PAYMENT_SERVICE,
  type PaymentService,
} from 'src/tickets/domain/services/payment.service.interface';
import { StripeWebhookHandler } from '../../application/handlers/stripe-webhook.handler';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: PaymentService,
    private readonly webhookHandler: StripeWebhookHandler,
  ) {}

  /**
   * POST /webhooks/stripe
   * Handles incoming Stripe webhook events.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    try {
      const event = this.paymentService.constructWebhookEvent(
        rawBody,
        signature,
      );

      this.logger.log(`Received Stripe webhook: ${event.type}`);
      return this.webhookHandler.handle(event);
    } catch (error) {
      this.logger.error('Webhook processing failed', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }
}
