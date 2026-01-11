import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'
import type {
  ChatAPI,
  ConversationResponse,
  SendMessageAPIResponse,
  UnreadMessageResponse,
} from '../interfaces/chat'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { ConversationID, FirstMessage, Message } from '../types/chat'

export const createChatApi = (chatClient: ApiClient): ChatAPI => ({
  async startConversation(
    userId: string,
    firstMessage: FirstMessage
  ): Promise<SendMessageAPIResponse> {
    return chatClient.post<SendMessageAPIResponse>(`users/${userId}/conversations`, firstMessage)
  },
  async getConversations(
    userId: string,
    params?: {
      pagination?: PaginatedRequest
      query?: string
      recipientId?: string
    }
  ): Promise<PaginatedResponse<ConversationResponse>> {
    return chatClient.get<PaginatedResponse<ConversationResponse>>(
      `/users/${userId}/conversations${buildQueryParams({
        ...evaluatePagination(params?.pagination),
        // query: params?.query,
        // recipientId: params?.recipientId,
      })}`
    )
  },
  async sendMessage(
    senderId: UserID,
    conversationId: ConversationID,
    content: string
  ): Promise<SendMessageAPIResponse> {
    return chatClient.post<SendMessageAPIResponse>(
      `users/${senderId}/conversations/${conversationId}`,
      {
        content,
      }
    )
  },
  async unreadMessageCountFor(userId: UserID): Promise<UnreadMessageResponse> {
    return chatClient.get<UnreadMessageResponse>(`users/${userId}/conversations/unread/count`)
  },
  async getConversationMessages(
    userId: UserID,
    conversationId: ConversationID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Message>> {
    return chatClient.get<PaginatedResponse<Message>>(
      `users/${userId}/conversations/${conversationId}/messages${buildQueryParams({
        ...evaluatePagination(pagination),
      })}`
    )
  },
  //TODO: post -> patch
  async readConversationMessages(conversationId: ConversationID, userId: UserID): Promise<void> {
    return chatClient.post<void>(`users/${userId}/conversations/${conversationId}/read`, {})
  },
})
