import { IsOptional } from 'class-validator';
import { PaginatedQueryDto } from './paginated-query.dto';

export class PaginatedSearchQueryDto extends PaginatedQueryDto {
  @IsOptional()
  search?: string;
}
