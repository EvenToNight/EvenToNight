import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFollowDto {
  @IsString()
  @IsNotEmpty()
  followerId: string;

  @IsString()
  @IsNotEmpty()
  followedId: string;
}
