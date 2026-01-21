import { IsString, IsNotEmpty } from 'class-validator';

export class UserDeletedDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
