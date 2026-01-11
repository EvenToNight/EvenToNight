import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsIn,
} from 'class-validator';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

export class CreateEventTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(TicketType.getAllValues(), {
    message: 'type must be one of: ' + TicketType.getAllValues().join(', '),
  })
  type: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
