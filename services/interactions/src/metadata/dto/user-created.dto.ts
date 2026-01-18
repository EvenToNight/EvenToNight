import { IsString, IsNotEmpty } from 'class-validator';

export class UserCreatedDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
