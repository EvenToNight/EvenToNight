import { IsString, IsNotEmpty, IsDate, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @IsNotEmpty()
  @IsIn(EventStatus.getAllValues(), {
    message: 'status must be one of: ' + EventStatus.getAllValues().join(', '),
  })
  status: string;
}
