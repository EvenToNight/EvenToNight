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
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCheckoutSessionHandler } from '../../application/handlers/create-checkout-session.handler';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
} from '../../application/dto/create-checkout-session.dto';
import type { PaymentService } from '../../domain/services/payment.service.interface';
import { PAYMENT_SERVICE } from '../..//domain/services/payment.service.interface';
import type { Response } from 'express';
import { CheckoutSessionExpiredHandler } from 'src/tickets/application/handlers/checkout-session-expired.handler';
import { CurrentUser, JwtAuthGuard } from 'src/commons/infrastructure/auth';

@Controller('checkout-sessions')
export class CheckoutSessionsController {
  private readonly logger = new Logger(CheckoutSessionsController.name);
  constructor(
    private readonly createCheckoutSessionHandler: CreateCheckoutSessionHandler,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: PaymentService,
    private readonly checkoutSessionExpiredHandler: CheckoutSessionExpiredHandler,
  ) {}

  /**
   * POST /checkout-sessions
   * Create a new checkout session for multiple tickets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body(ValidationPipe) dto: CreateCheckoutSessionDto,
    @CurrentUser('userId') userId: string,
  ): Promise<CheckoutSessionResponseDto> {
    if (dto.userId !== userId) {
      throw new ForbiddenException(
        'User ID in token does not match user ID in request body',
      );
    }
    return this.createCheckoutSessionHandler.handle(dto);
  }

  /**
   * GET /checkout-sessions/:sessionId/cancel
   * Handles the cancellation of a checkout session.
   */
  //TODO: how works auth there?
  @Get(':sessionId/cancel')
  @HttpCode(HttpStatus.OK)
  async handleCancel(
    @Param('sessionId') sessionId: string,
    @Query('redirect_to') redirectTo: string,
    @Res() res: Response,
  ) {
    try {
      console.log('Handling cancel for session:', sessionId);
      const session = await this.paymentService.getCheckoutSession(sessionId);
      if (session.status === 'open') {
        console.log('Expiring session:', sessionId);
        await this.paymentService.expireCheckoutSession(sessionId);
        this.logger.log(`Manually expired checkout session: ${sessionId}`);
        await this.checkoutSessionExpiredHandler.handle(
          session.id,
          session.orderId,
          'User cancelled checkout',
        );
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
}
