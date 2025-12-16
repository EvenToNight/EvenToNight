import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteFollowDto {
  @IsString()
  @IsNotEmpty()
  followerId: string;

  @IsString()
  @IsNotEmpty()
  followedId: string;
}
