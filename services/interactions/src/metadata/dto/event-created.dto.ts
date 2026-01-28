import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class EventCreatedDto {
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

  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
