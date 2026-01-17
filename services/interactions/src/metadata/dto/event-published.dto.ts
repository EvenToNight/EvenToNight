import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDefined,
} from 'class-validator';

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
}
