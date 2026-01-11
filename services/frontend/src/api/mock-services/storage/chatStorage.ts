import type { Conversation, ConversationMessages } from '@/api/types/chat'
import { dateReviver } from '@/api/utils/parsingUtils'

const STORAGE_KEY_MESSAGES = 'mock-chat-messages'
const STORAGE_KEY_CONVERSATIONS = 'mock-chat-conversations'

export function loadMessages(defaultMessages: ConversationMessages): ConversationMessages {
  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES)
  if (stored) {
    return JSON.parse(stored, dateReviver)
  } else {
    saveMessages(defaultMessages)
    return defaultMessages
  }
}

export function saveMessages(messages: ConversationMessages): void {
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
}

export function loadConversations(defaultConversations: Conversation[]): Conversation[] {
  const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS)
  if (stored) {
    return JSON.parse(stored, dateReviver)
  } else {
    saveConversations(defaultConversations)
    return defaultConversations
  }
}

export function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations))
}

export function resetStorage(): void {
  localStorage.removeItem(STORAGE_KEY_MESSAGES)
  localStorage.removeItem(STORAGE_KEY_CONVERSATIONS)
}
