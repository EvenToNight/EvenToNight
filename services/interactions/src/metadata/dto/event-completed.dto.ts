import { IsString, IsNotEmpty } from 'class-validator';

export class EventCompletedDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
