import { ConversationID, UserID } from '../types';

export interface ConversationListItemDTO {
  id: ConversationID;
  organizationId: UserID;
  organizationName: string;
  organizationAvatar: string;
  memberId: UserID;
  memberName: string;
  memberAvatar: string;
  lastMessage: {
    content: string;
    senderId: UserID;
    timestamp: Date;
  };
  unreadCount: number;
}
