import type { Conversation, ConversationMessages } from '@/api/types/support'

const STORAGE_KEY_MESSAGES = 'mock-support-messages'
const STORAGE_KEY_CONVERSATIONS = 'mock-support-conversations'

// Load data from localStorage or return default data
export function loadMessages(defaultMessages: ConversationMessages): ConversationMessages {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MESSAGES)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      Object.keys(parsed).forEach((convId) => {
        parsed[convId] = parsed[convId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      })
      return parsed
    }
  } catch (error) {
    console.error('[SupportStorage] Error loading messages from localStorage:', error)
  }
  // Save default data to localStorage on first load
  saveMessages(defaultMessages)
  return defaultMessages
}

export function saveMessages(messages: ConversationMessages): void {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
  } catch (error) {
    console.error('[SupportStorage] Error saving messages to localStorage:', error)
  }
}

export function loadConversations(defaultConversations: Conversation[]): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      return parsed.map((conv: any) => ({
        ...conv,
        lastMessageTime: new Date(conv.lastMessageTime),
      }))
    }
  } catch (error) {
    console.error('[SupportStorage] Error loading conversations from localStorage:', error)
  }
  // Save default data to localStorage on first load
  saveConversations(defaultConversations)
  return defaultConversations
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations))
  } catch (error) {
    console.error('[SupportStorage] Error saving conversations to localStorage:', error)
  }
}

// Reset storage to default data
export function resetStorage(): void {
  localStorage.removeItem(STORAGE_KEY_MESSAGES)
  localStorage.removeItem(STORAGE_KEY_CONVERSATIONS)
}
