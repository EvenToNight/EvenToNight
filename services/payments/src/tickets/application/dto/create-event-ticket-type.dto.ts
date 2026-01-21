import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { MoneyDto } from './money.dto';
import { Type } from 'class-transformer';

export class CreateEventTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(TicketType.getAllValues(), {
    message: 'type must be one of: ' + TicketType.getAllValues().join(', '),
  })
  type: string;

  //TODO: make required?
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => MoneyDto)
  price: MoneyDto;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  creatorId: string;
}
