import { IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReservationItemDto {
  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ReserveTicketsDto {
  @IsString()
  userId: string;

  @IsString()
  eventId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items: ReservationItemDto[];
}
