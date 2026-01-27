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
  @IsIn(TicketType.getAllValues(), {
    message: 'type must be one of: ' + TicketType.getAllValues().join(', '),
  })
  type: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
