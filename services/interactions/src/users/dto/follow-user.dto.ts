import { IsString, IsNotEmpty } from 'class-validator';

export class FollowUserDto {
  @IsString()
  @IsNotEmpty()
  followedId: string;
}
