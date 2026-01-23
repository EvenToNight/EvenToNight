import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class EventUpdatedDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collaboratorIds?: string[];

  @IsString()
  @IsNotEmpty()
  name: string;
}
