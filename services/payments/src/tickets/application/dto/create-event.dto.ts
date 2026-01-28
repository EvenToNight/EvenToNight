import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsIn,
  ValidateIf,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @Type(() => Date)
  @IsDate()
  @ValidateIf(
    (o: CreateEventDto) =>
      o.status !== EventStatus.DRAFT.toString() ||
      (o.date !== undefined && o.date !== null),
  )
  @IsNotEmpty({ message: 'date is required when status is not DRAFT' })
  date?: Date;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(EventStatus.getAllValues(), {
    message: 'status must be one of: ' + EventStatus.getAllValues().join(', '),
  })
  status: string;
}
