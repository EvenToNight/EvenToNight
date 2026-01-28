import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedQueryDto } from 'src/commons/application/dto/paginated-query.dto';

export class GetEventsByPriceQueryDto extends PaginatedQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';
}
