import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { StripeService } from '../../infrastructure/stripe/stripe.service';
import { EventPublisher } from '../../../commons/intrastructure/messaging/event-publisher';
import { CheckoutSessionExpiredEvent } from '../../../tickets/domain/events/checkout-session-expired.event';
import { Stripe } from 'stripe';

@Controller('checkout')
export class CheckoutCancelController {
  private readonly logger = new Logger(CheckoutCancelController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @Get('cancel')
  async handleCancel(
    @Query('session_id') sessionId: string,
    @Query('redirect_to') redirectTo: string,
    @Res() res: Response,
  ) {
    if (!sessionId) {
      this.logger.error('Missing session_id in cancel callback');
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Missing session_id parameter',
      });
    }

    try {
      const session = await this.stripeService.getCheckoutSession(sessionId);
      if (session.status === 'open') {
        await this.stripeService.expireCheckoutSession(sessionId);
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

  private async publishExpiredEvent(session: Stripe.Checkout.Session) {
    try {
      const ticketIdsJson = session.metadata?.ticketIds;
      const userId = session.metadata?.userId;

      if (!ticketIdsJson || !userId) {
        this.logger.error(
          `Missing metadata in session ${session.id} - cannot publish expired event`,
        );
        return;
      }

      const ticketIds: string[] = JSON.parse(ticketIdsJson) as string[];

      await this.eventPublisher.publish(
        new CheckoutSessionExpiredEvent({
          sessionId: session.id,
          ticketIds,
          userId: userId,
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
