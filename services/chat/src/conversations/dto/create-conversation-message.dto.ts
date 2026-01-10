import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import type { UserID } from '../types';

export class CreateConversationMessageDto {
  @IsString()
  @IsNotEmpty()
  recipientId: UserID;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;
}
