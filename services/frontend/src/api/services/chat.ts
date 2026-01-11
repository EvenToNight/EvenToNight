import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'
import type {
  ChatAPI,
  ConversationAPIResponse,
  ConversationResponse,
  MessageAPIResponse,
  SendMessageAPIResponse,
  UnreadMessageResponse,
} from '../interfaces/chat'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type {
  ConversationID,
  FirstMessage,
  Message as AdaptedMessage,
  ChatUser,
} from '../types/chat'
import { Message, Conversation } from '../adapters/chat'
export const createChatApi = (chatClient: ApiClient): ChatAPI => ({
  async startConversation(
    userId: string,
    firstMessage: FirstMessage
  ): Promise<SendMessageAPIResponse> {
    return chatClient.post<SendMessageAPIResponse>(`/users/${userId}/conversations`, firstMessage)
  },
  async getConversations(
    userId: string,
    params?: {
      pagination?: PaginatedRequest
      query?: string
      recipientId?: string
    }
  ): Promise<PaginatedResponse<ConversationResponse>> {
    const response = await chatClient.get<PaginatedResponse<ConversationAPIResponse | ChatUser>>(
      `/users/${userId}/conversations${buildQueryParams({
        ...evaluatePagination(params?.pagination),
        // query: params?.query,
        // recipientId: params?.recipientId,
      })}`
    )
    const { items, ...rest } = response
    const adaptedConversations = response.items.map((conv) => {
      if ('unreadCount' in conv) {
        return Conversation.fromApi(conv)
      }
      return conv
    })
    return { items: adaptedConversations, ...rest }
  },
  async sendMessage(
    senderId: UserID,
    conversationId: ConversationID,
    content: string
  ): Promise<SendMessageAPIResponse> {
    return chatClient.post<SendMessageAPIResponse>(
      `/users/${senderId}/conversations/${conversationId}`,
      {
        content,
      }
    )
  },
  async unreadMessageCountFor(userId: UserID): Promise<UnreadMessageResponse> {
    return chatClient.get<UnreadMessageResponse>(`/users/${userId}/conversations/unread/count`)
  },
  async getConversationMessages(
    userId: UserID,
    conversationId: ConversationID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<AdaptedMessage>> {
    const response = await chatClient.get<PaginatedResponse<MessageAPIResponse>>(
      `/users/${userId}/conversations/${conversationId}/messages${buildQueryParams({
        ...evaluatePagination(pagination),
      })}`
    )
    const { items, ...rest } = response
    const adaptedMessages = response.items.reverse().map((msg) => {
      return Message.fromApi(msg)
    })
    return { items: adaptedMessages, ...rest }
  },
  //TODO: post -> patch
  async readConversationMessages(conversationId: ConversationID, userId: UserID): Promise<void> {
    return chatClient.post<void>(`/users/${userId}/conversations/${conversationId}/read`, {})
  },
})
