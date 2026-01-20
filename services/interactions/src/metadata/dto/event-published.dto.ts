import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class EventPublishedDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collaboratorIds?: string[];

  @IsString()
  @IsNotEmpty()
  name: string;
}
