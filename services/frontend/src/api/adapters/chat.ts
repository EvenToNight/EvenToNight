import type { MessageAPIResponse, ConversationAPIResponse } from '@/api/interfaces/chat'
import type {
  Message as AdaptedMessage,
  Conversation as AdaptedConversation,
} from '@/api/types/chat'

export const Message = {
  //TODO: evaluate to leave chatUser in sender field
  fromApi(dto: MessageAPIResponse): AdaptedMessage {
    return {
      id: dto.id,
      conversationId: dto.conversationId,
      senderId: dto.sender.id,
      content: dto.content,
      createdAt: dto.createdAt,
      isRead: dto.isRead,
    }
  },
}

export const Conversation = {
  fromApi(dto: ConversationAPIResponse): AdaptedConversation {
    return {
      id: dto.id,
      organization: dto.organization,
      member: dto.member,
      lastMessage: {
        senderId: dto.lastMessage.senderId,
        content: dto.lastMessage.content,
        createdAt: dto.lastMessage.timestamp,
      },
      unreadCount: dto.unreadCount,
    }
  },
}
