import { IsString, IsNotEmpty, IsIn } from 'class-validator';

const WEBHOOK_EVENT_TYPES = [
  'checkout.session.completed',
  'checkout.session.expired',
] as const;

export class WebhookEventDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsIn(WEBHOOK_EVENT_TYPES, {
    message: `type must be one of: ${WEBHOOK_EVENT_TYPES.join(', ')}`,
  })
  type: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;
}
