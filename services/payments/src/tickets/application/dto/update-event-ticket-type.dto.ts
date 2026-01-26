import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MoneyDto } from './money.dto';

export class UpdateEventTicketTypeDto {
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
}
