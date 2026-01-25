import { IsString, IsNotEmpty } from 'class-validator';

export class UserDeletedDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
