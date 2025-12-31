import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number; // Partial refund amount in cents (optional, defaults to full refund)

  @IsString()
  reason: string; // 'event_cancelled', 'user_request', 'duplicate'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ticketIds?: string[]; // Specific tickets to refund (optional)
}
