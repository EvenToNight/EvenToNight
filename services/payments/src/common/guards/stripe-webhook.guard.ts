import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { StripeService } from '../../payments/services/stripe.service';

/**
 * Guard to verify Stripe webhook signature
 * CRITICAL for security - prevents webhook spoofing
 */
@Injectable()
export class StripeWebhookGuard implements CanActivate {
  private readonly logger = new Logger(StripeWebhookGuard.name);

  constructor(private stripeService: StripeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['stripe-signature'];

    if (!signature) {
      this.logger.error('Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!request.rawBody) {
      this.logger.error('Missing raw body for webhook verification');
      throw new BadRequestException('Raw body required for webhook verification');
    }

    try {
      // Verify signature
      const event = await this.stripeService.constructWebhookEvent(
        request.rawBody,
        signature,
      );

      // Store event in request for controller use
      request.stripeEvent = event;

      return true;
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error.message}`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
