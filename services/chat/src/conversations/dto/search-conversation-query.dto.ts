import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedRequest } from '../../common/paginated-request.dto';

export class SearchConversationsQueryDto implements PaginatedRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;
}
