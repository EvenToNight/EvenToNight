import { ConversationID, UserID } from '../types';

export interface ConversationDetailDTO {
  id: ConversationID;
  organization: {
    id: UserID;
    name: string;
    avatar: string;
  };
  member: {
    id: UserID;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
