import { IsString, IsNotEmpty } from 'class-validator';

export class EventCancelledDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
