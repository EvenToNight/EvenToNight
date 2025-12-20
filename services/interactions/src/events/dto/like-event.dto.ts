import { IsString, IsNotEmpty } from 'class-validator';

export class LikeEventDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
