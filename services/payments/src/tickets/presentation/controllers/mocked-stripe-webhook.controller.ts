import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { StripeWebhookHandler } from 'src/tickets/application/handlers/stripe-webhook.handler';
import { WebhookEventDto } from 'src/tickets/application/dto/webhook-event.dto';

@Controller('dev/webhooks/stripe')
export class MockedStripeWebhookController {
  private readonly logger = new Logger(MockedStripeWebhookController.name);

  constructor(private readonly webhookHandler: StripeWebhookHandler) {}

  /**
   * POST /dev/webhooks/stripe
   * Handles incoming Mock Stripe webhook events.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body(ValidationPipe) dto: WebhookEventDto) {
    try {
      this.logger.log(`Received Mock webhook: ${dto.type}`);
      return this.webhookHandler.handle(dto);
    } catch (error) {
      this.logger.error('Failed to process mock webhook', error);
      throw error;
    }
  }
}
