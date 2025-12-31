import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationItemDto } from '../../inventory/dto/reserve-tickets.dto';

export class CreateCheckoutDto {
  @IsString()
  userId: string;

  @IsString()
  eventId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items: ReservationItemDto[];
}

export class CreateCheckoutResponseDto {
  reservationId: string;
  paymentIntentId: string;
  clientSecret: string;
  totalAmount: number;
  expiresAt: Date;
}
