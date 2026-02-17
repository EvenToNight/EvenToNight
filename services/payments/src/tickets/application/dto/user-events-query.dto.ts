import { IsOptional, IsEnum, IsIn } from 'class-validator';
import { PaginatedQueryDto } from '@libs/nestjs-common/src/pagination/paginated-query.dto';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

export class UserEventsQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsIn(
    [EventStatus.PUBLISHED, EventStatus.COMPLETED, EventStatus.CANCELLED].map(
      (status) => status.toString(),
    ),
  )
  status?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
