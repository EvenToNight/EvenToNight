import { IsString, IsNotEmpty } from 'class-validator';

export class EventPublishedDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
