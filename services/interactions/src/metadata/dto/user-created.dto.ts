import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserCreatedDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
