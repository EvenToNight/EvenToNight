import { ConversationID, UserID } from '../types';

export interface ConversationListItemDTO {
  id: ConversationID | null;
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
  lastMessage: {
    content: string;
    senderId: UserID;
    timestamp: Date;
  } | null;
  unreadCount: number;
}
