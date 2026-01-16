import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import type { WebhookEvent } from 'src/tickets/domain/types/payment-service.types';
import { StripeWebhookHandler } from 'src/tickets/application/handlers/stripe-webhook.handler';

@Controller('dev/webhooks/stripe')
export class MockedCheckoutWebhookController {
  private readonly logger = new Logger(MockedCheckoutWebhookController.name);

  constructor(private readonly webhookHandler: StripeWebhookHandler) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  mockCheckoutCompleted(@Body(ValidationPipe) dto: WebhookEvent) {
    try {
      this.logger.log(`Received Mock webhook: ${dto.type}`);
      return this.webhookHandler.handle(dto);
    } catch (error) {
      this.logger.error('Failed to process mock checkout', error);
      throw error;
    }
  }
}
