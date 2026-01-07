import { ConversationID, UserID } from '../types';

export interface MessageDTO {
  id: string;
  conversationId: ConversationID;
  sender: {
    id: UserID;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: Date;
  isRead: boolean;
}
