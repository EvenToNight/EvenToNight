import { IsOptional, IsString } from 'class-validator';
import { PaginatedQueryDto } from '@libs/nestjs-common';

export class GetUserTicketsQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  eventId?: string;
}
