import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'
import type {
  ChatAPI,
  ConversationAPIResponse,
  MessageAPIResponse,
  SendMessageAPIResponse,
  UnreadMessageResponse,
} from '../interfaces/chat'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type {
  ConversationID,
  FirstMessage,
  Message as AdaptedMessage,
  Conversation,
} from '../types/chat'
import { Message, Conversation as ConversationAdapter } from '../adapters/chat'
export const createChatApi = (chatClient: ApiClient): ChatAPI => ({
  async getConversation(userId: UserID, conversationId: ConversationID): Promise<Conversation> {
    const response = await chatClient.get<ConversationAPIResponse>(
      `/users/${userId}/conversations/${conversationId}`
    )
    return ConversationAdapter.fromApi(response)
  },
  async startConversation(
    userId: UserID,
    firstMessage: FirstMessage
  ): Promise<SendMessageAPIResponse> {
    return chatClient.post<SendMessageAPIResponse>(`/users/${userId}/conversations`, firstMessage)
  },
  async getConversations(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Conversation>> {
    const response = await chatClient.get<PaginatedResponse<ConversationAPIResponse>>(
      `/users/${userId}/conversations${buildQueryParams({
        ...evaluatePagination(pagination),
      })}`
    )
    const { items, ...rest } = response
    const adaptedConversations = response.items.map((conv) => {
      return ConversationAdapter.fromApi(conv)
    })
    return { items: adaptedConversations, ...rest }
  },
  async searchConversations(
    userId: UserID,
    params: {
      name: string
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponse<Conversation>> {
    const response = await chatClient.get<PaginatedResponse<ConversationAPIResponse>>(
      `/users/${userId}/conversations/search${buildQueryParams({
        ...evaluatePagination(params?.pagination),
        name: params.name,
      })}`
    )
    const { items, ...rest } = response
    const adaptedConversations = response.items.map((conv) => {
      return ConversationAdapter.fromApi(conv)
    })
    return { items: adaptedConversations, ...rest }
  },
  async getConversationBetween(
    organizationId: UserID,
    memberId: UserID
  ): Promise<Conversation | null> {
    return chatClient
      .get<Conversation>(`/conversations/${organizationId}/${memberId}`)
      .catch(() => null)
  },
  async sendMessage(
    senderId: UserID,
    conversationId: ConversationID,
    content: string
  ): Promise<SendMessageAPIResponse> {
    return chatClient.post<SendMessageAPIResponse>(
      `/users/${senderId}/conversations/${conversationId}/messages`,
      {
        content,
      }
    )
  },
  async unreadMessageCountFor(userId: UserID): Promise<UnreadMessageResponse> {
    return chatClient.get<UnreadMessageResponse>(`/users/${userId}/unread/count`)
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
