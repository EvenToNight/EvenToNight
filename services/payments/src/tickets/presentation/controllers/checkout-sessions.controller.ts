import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Get,
  Query,
  Res,
  Param,
  Inject,
  Logger,
} from '@nestjs/common';
import { CreateCheckoutSessionHandler } from '../../application/handlers/create-checkout-session.handler';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
} from '../../application/dto/create-checkout-session.dto';
import type { PaymentService } from '../../domain/services/payment.service.interface';
import { PAYMENT_SERVICE } from '../..//domain/services/payment.service.interface';
import { EventPublisher } from '../../../commons/intrastructure/messaging/event-publisher';
import type { Response } from 'express';
import { CheckoutSessionExpiredEvent } from '../../domain/events/checkout-session-expired.event';
import { CheckoutSession } from 'src/tickets/domain/types/payment-service.types';
import { OrderService } from 'src/tickets/application/services/order.service';

@Controller('checkout-sessions')
export class CheckoutSessionsController {
  private readonly logger = new Logger(CheckoutSessionsController.name);
  constructor(
    private readonly createCheckoutSessionHandler: CreateCheckoutSessionHandler,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: PaymentService,
    private readonly eventPublisher: EventPublisher,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Create a new checkout session for multiple tickets
   * POST /checkout-sessions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCheckoutSession(
    @Body(ValidationPipe) dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    return this.createCheckoutSessionHandler.handle(dto);
  }

  @Get(':sessionId')
  async handleCancel(
    @Param('sessionId') sessionId: string,
    @Query('redirect_to') redirectTo: string,
    @Res() res: Response,
  ) {
    try {
      const session = await this.paymentService.getCheckoutSession(sessionId);
      if (session.status === 'open') {
        await this.paymentService.expireCheckoutSession(sessionId);
        this.logger.log(`Manually expired checkout session: ${sessionId}`);
        await this.publishExpiredEvent(session);
      } else {
        this.logger.log(
          `Session ${sessionId} already in status: ${session.status}`,
        );
      }

      return res.redirect(redirectTo);
    } catch (error) {
      this.logger.error(
        `Failed to handle cancel for session ${sessionId}`,
        error,
      );

      // TODO: Redirect anyway to avoid user stuck on error page?
      return res.redirect(redirectTo);
    }
  }

  private async publishExpiredEvent(session: CheckoutSession) {
    try {
      await this.eventPublisher.publish(
        new CheckoutSessionExpiredEvent({
          sessionId: session.id,
          orderId: session.orderId,
          expirationReason: 'User cancelled checkout',
        }),
      );

      this.logger.log(
        `Checkout session expired event published for cancelled session ${session.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish expired event for session ${session.id}`,
        error,
      );
    }
  }
}
