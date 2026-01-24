import { IsString, IsNotEmpty } from 'class-validator';

export class EventDeletedDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
