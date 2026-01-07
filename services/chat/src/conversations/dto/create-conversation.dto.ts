import { IsNotEmpty, IsString } from 'class-validator';
import type { UserID } from '../types';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  organizationId: UserID;

  @IsString()
  @IsNotEmpty()
  memberId: UserID;
}
