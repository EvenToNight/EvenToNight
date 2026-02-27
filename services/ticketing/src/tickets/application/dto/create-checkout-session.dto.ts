import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutTicketItemDto {
  @IsString()
  @IsNotEmpty()
  ticketTypeId: string;

  @IsString()
  @IsNotEmpty()
  attendeeName: string;
}

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutTicketItemDto)
  items: CheckoutTicketItemDto[];

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  successUrl: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  cancelUrl: string;
}

export class CheckoutSessionResponseDto {
  sessionId: string;
  redirectUrl: string;
  expiresAt: number;
  orderId: string;
}
