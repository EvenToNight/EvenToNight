import { IsString, IsNotEmpty } from 'class-validator';
import type { UserID } from '../types';

export class MarkAsReadDto {
  @IsString()
  @IsNotEmpty()
  userId: UserID;
}
