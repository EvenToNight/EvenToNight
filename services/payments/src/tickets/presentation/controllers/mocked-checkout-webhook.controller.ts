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
  BaseCheckoutSessionCompletedEvent,
  type BaseCheckoutSessionCompletedEventPayload,
} from 'src/tickets/domain/events/base-checkout-session-completed.event';

@Controller('dev/checkout-webhook')
export class MockedCheckoutWebhookController {
  private readonly logger = new Logger(MockedCheckoutWebhookController.name);

  constructor(private readonly eventPublisher: EventPublisher) {}

  @Post('completed')
  @HttpCode(HttpStatus.OK)
  async mockCheckoutCompleted(
    @Body(ValidationPipe) dto: BaseCheckoutSessionCompletedEventPayload,
  ) {
    this.logger.warn(
      `🚨 MOCK WEBHOOK: Simulating successful checkout for session ${dto.sessionId}`,
    );

    try {
      await this.eventPublisher.publish(
        new BaseCheckoutSessionCompletedEvent(dto),
      );

      this.logger.log(
        `✅ Mock checkout completed event published for ${dto.ticketIds.length} tickets`,
      );

      return {
        success: true,
        message: 'Mock checkout completed',
        ticketIds: dto.ticketIds,
      };
    } catch (error) {
      this.logger.error('Failed to process mock checkout', error);
      throw error;
    }
  }
}
