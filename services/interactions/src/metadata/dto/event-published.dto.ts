import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDefined,
} from 'class-validator';

export class EventPublishedDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collaboratorIds?: string[];
}
