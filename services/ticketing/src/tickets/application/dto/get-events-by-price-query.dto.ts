import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedQueryDto } from '@libs/nestjs-common';

export class GetEventsByPriceQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';
}
