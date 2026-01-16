import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { EventPublisher } from '../../../commons/intrastructure/messaging/event-publisher';
import {
  CheckoutSessionCompletedEvent,
  type CheckoutSessionCompletedEventPayload,
} from 'src/tickets/domain/events/checkout-session-completed.event';

@Controller('webhooks/dev')
export class MockedCheckoutWebhookController {
  private readonly logger = new Logger(MockedCheckoutWebhookController.name);

  constructor(private readonly eventPublisher: EventPublisher) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async mockCheckoutCompleted(
    @Body(ValidationPipe) dto: CheckoutSessionCompletedEventPayload,
  ) {
    this.logger.warn(
      `🚨 MOCK WEBHOOK: Simulating successful checkout for session ${dto.sessionId}`,
    );

    try {
      await this.eventPublisher.publish(new CheckoutSessionCompletedEvent(dto));

      this.logger.log(
        `✅ Mock checkout completed event published for order with id ${dto.orderId}`,
      );

      return {
        success: true,
        message: 'Mock checkout completed',
        orderId: dto.orderId,
      };
    } catch (error) {
      this.logger.error('Failed to process mock checkout', error);
      throw error;
    }
  }
}
