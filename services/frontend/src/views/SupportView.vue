<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/support/ConversationList.vue'
import type { Conversation, Message } from '@/api/types/support'
import type { User } from '@/api/types/users'
import MessageInput from '@/components/support/MessageInput.vue'
import ChatArea from '@/components/support/ChatArea.vue'
import { useNavigation } from '@/router/utils'
import type { WebSocket } from '@/api/mock-services/webSocket'
import { isNewMessageEvent } from '@/api/mock-services/webSocket'

const { query, removeQuery } = useNavigation()
const authStore = useAuthStore()
const conversations = ref<Conversation[]>([])
const selectedConversationId = ref<string>()
const selectedMessages = ref<Message[]>([])
const loading = ref(false)
const loadingMoreMessages = ref(false)
const hasMoreMessages = ref(true)
const messagesLimit = 50
const searchResults = ref<User[]>([])
const selectedOrganization = ref<User | undefined>()
const isNewConversation = ref(false)
const websocket = ref<WebSocket | null>(null)
const twoColumnLayout = ref<InstanceType<typeof TwoColumnLayout> | null>(null)

const selectedConversation = computed<Conversation | undefined>(() => {
  return conversations.value.find((c) => c.id === selectedConversationId.value)
})

const displayConversation = computed<Conversation | undefined>(() => {
  if (isNewConversation.value && selectedOrganization.value) {
    // Create temporary conversation object for display purposes
    return {
      id: selectedOrganization.value.id,
      organizationId: selectedOrganization.value.id,
      organizationName: selectedOrganization.value.name,
      organizationAvatar: selectedOrganization.value.avatarUrl || '',
      memberId: authStore.user?.id || '',
      memberName: authStore.user?.name || '',
      memberAvatar: authStore.user?.avatarUrl || '',
      lastMessage: '',
      lastMessageTime: new Date(),
      lastMessageSenderId: '',
      unreadCount: 0,
    } as Conversation
  }
  return selectedConversation.value
})

onMounted(async () => {
  await loadConversations()
  const organizationId = query.organizationId as string | undefined
  if (organizationId) {
    await loadOrganizationConversation(organizationId)
  }

  // Initialize WebSocket for real-time updates
  if (authStore.user?.id) {
    console.log('[SupportView] Initializing WebSocket for user:', authStore.user.id)
    websocket.value = api.notification.createWebSocket(authStore.user.id)
    websocket.value.connect()

    // Listen for new messages from other tabs
    websocket.value.on((event) => {
      console.log('[SupportView] WebSocket event received:', event)
      if (isNewMessageEvent(event)) {
        console.log('[SupportView] Handling new message event')
        handleWebSocketNewMessage(event)
      }
    })
  }
})

onUnmounted(() => {
  // Disconnect WebSocket when component is destroyed
  if (websocket.value) {
    websocket.value.disconnect()
  }
})

async function loadOrganizationConversation(organizationId: string) {
  //TODO seach usign API
  const existingConversation = conversations.value.find((c) => c.organizationId === organizationId)
  if (existingConversation) {
    await handleSelectConversation(existingConversation.id)
  } else {
    try {
      const org = await api.users.getUserById(organizationId)
      selectedOrganization.value = org
      selectedConversationId.value = organizationId
      isNewConversation.value = true
      selectedMessages.value = []
    } catch (error) {
      console.error('Failed to load organization:', error)
    }
  }
  removeQuery('organizationId')
}

async function loadConversations() {
  if (!authStore.user?.id) return
  try {
    loading.value = true
    const response = await api.support.getConversations(authStore.user.id)
    conversations.value = response.items
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    loading.value = false
  }
}

async function handleSelectConversation(conversationId: string, isNewOrg = false) {
  try {
    loading.value = true
    hasMoreMessages.value = true
    selectedMessages.value = []
    isNewConversation.value = isNewOrg

    if (isNewOrg) {
      // Find the organization in search results
      selectedOrganization.value = searchResults.value.find((org) => org.id === conversationId)
      selectedConversationId.value = conversationId
      loading.value = false
      // Show content in mobile
      twoColumnLayout.value?.showContent()
      return
    }

    const response = await api.support.getConversationMessages(conversationId, {
      limit: messagesLimit,
      offset: 0,
    })

    selectedMessages.value = response.items
    hasMoreMessages.value = response.hasMore
    selectedOrganization.value = undefined

    const conversation = conversations.value.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
    selectedConversationId.value = conversationId

    // Show content in mobile
    twoColumnLayout.value?.showContent()
  } catch (error) {
    console.error('Failed to load conversation messages:', error)
  } finally {
    loading.value = false
  }
}

async function handleSearchOrganizations(query: string) {
  if (!query.trim()) {
    searchResults.value = []
    return
  }

  try {
    const response = await api.users.searchUsers({
      name: query,
      role: 'organization',
      pagination: { limit: 10, offset: 0 },
    })

    // Filter out organizations that already have conversations
    const conversationOrgIds = new Set(
      conversations.value.map((c) =>
        authStore.user?.id === c.memberId ? c.organizationId : c.memberId
      )
    )

    searchResults.value = response.items.filter((org) => !conversationOrgIds.has(org.id))
  } catch (error) {
    console.error('Failed to search organizations:', error)
    searchResults.value = []
  }
}

function handleBackToList() {
  selectedConversationId.value = undefined
  selectedOrganization.value = undefined
  isNewConversation.value = false
  selectedMessages.value = []
  // Show sidebar in mobile
  twoColumnLayout.value?.showSidebar()
}

async function handleLoadMoreMessages() {
  if (!selectedConversationId.value || loadingMoreMessages.value || !hasMoreMessages.value) {
    return
  }

  try {
    loadingMoreMessages.value = true
    const response = await api.support.getConversationMessages(selectedConversationId.value, {
      limit: messagesLimit,
      offset: selectedMessages.value.length,
    })

    // Prepend older messages to the beginning
    selectedMessages.value = [...response.items, ...selectedMessages.value]
    hasMoreMessages.value = response.hasMore
  } catch (error) {
    console.error('Failed to load more messages:', error)
  } finally {
    loadingMoreMessages.value = false
  }
}

async function handleSendMessage(content: string) {
  if (!selectedConversationId.value || !authStore.user?.id) return
  if (!content.trim()) return

  try {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: authStore.user.id,
      content: content.trim(),
      timestamp: new Date(),
    }

    // If this is a new conversation with an organization, create it first
    if (isNewConversation.value && selectedOrganization.value) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        organizationId: selectedOrganization.value.id,
        organizationName: selectedOrganization.value.name,
        organizationAvatar: selectedOrganization.value.avatarUrl || '',
        memberId: authStore.user.id,
        memberName: authStore.user.name,
        memberAvatar: authStore.user.avatarUrl || '',
        lastMessage: content.trim(),
        lastMessageTime: newMessage.timestamp,
        lastMessageSenderId: newMessage.senderId,
        unreadCount: 0,
      }

      conversations.value.unshift(newConv)
      selectedConversationId.value = newConv.id
      isNewConversation.value = false
      selectedOrganization.value = undefined
    }

    await api.support.sendMessage(selectedConversationId.value, newMessage)
    selectedMessages.value.push(newMessage)

    // Update conversation's last message in the list and move to top
    const conversationIndex = conversations.value.findIndex(
      (c) => c.id === selectedConversationId.value
    )
    if (conversationIndex !== -1) {
      const conversation = conversations.value[conversationIndex]
      if (conversation) {
        conversation.lastMessage = content.trim()
        conversation.lastMessageTime = newMessage.timestamp
        conversation.lastMessageSenderId = newMessage.senderId

        // Move conversation to top of list
        conversations.value.splice(conversationIndex, 1)
        conversations.value.unshift(conversation)
      }
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

function handleWebSocketNewMessage(event: import('@/api/types/notification').NewMessageEvent) {
  console.log('[SupportView] handleWebSocketNewMessage called:', event)
  const { message, conversation: updatedConversation } = event.data

  // Check if the message is from the current user (sent from another tab)
  const isOwnMessage = message.senderId === authStore.user?.id
  console.log('[SupportView] Message is from current user:', isOwnMessage)

  // Update or add conversation in the list
  const existingConversationIndex = conversations.value.findIndex(
    (c) => c.id === event.conversationId
  )
  console.log('[SupportView] Existing conversation index:', existingConversationIndex)

  if (existingConversationIndex !== -1) {
    // Update existing conversation
    const conv = conversations.value[existingConversationIndex]
    if (conv) {
      conv.lastMessage = updatedConversation.lastMessage
      conv.lastMessageTime = updatedConversation.lastMessageTime
      conv.lastMessageSenderId = updatedConversation.lastMessageSenderId

      // Increment unread count only if it's not the currently selected conversation
      // and the message is not from the current user
      if (selectedConversationId.value !== event.conversationId && !isOwnMessage) {
        conv.unreadCount++
      }

      // Move conversation to top of list
      conversations.value.splice(existingConversationIndex, 1)
      conversations.value.unshift(conv)
    }
  } else {
    // Add new conversation to list (if it doesn't exist)
    conversations.value.unshift(updatedConversation)
  }

  // If this message belongs to the currently selected conversation, add it to messages
  if (selectedConversationId.value === event.conversationId) {
    // Check if message already exists (to avoid duplicates)
    const messageExists = selectedMessages.value.some((m) => m.id === message.id)
    if (!messageExists) {
      selectedMessages.value.push(message)
    }
  }
}
</script>

<template>
  <TwoColumnLayout ref="twoColumnLayout">
    <template #sidebar>
      <ConversationList
        :conversations="conversations"
        :selected-conversation-id="selectedConversationId"
        :organization-search-results="searchResults"
        @select-conversation="handleSelectConversation"
        @search="handleSearchOrganizations"
      />
    </template>
    <template #content>
      <div class="chat-content">
        <ChatArea
          :conversation="displayConversation"
          :messages="selectedMessages"
          @back="handleBackToList"
          @load-more="handleLoadMoreMessages"
        />
        <MessageInput
          v-if="selectedConversationId || isNewConversation"
          @send-message="handleSendMessage"
        />
      </div>
    </template>
  </TwoColumnLayout>
</template>
<style scoped lang="scss">
.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.no-chat-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-6;
  background-color: var(--q-background);
  border-top: 1px solid var(--q-separator-color);
  min-height: 62px;

  p {
    margin: 0;
    color: var(--q-text-secondary);
    font-size: $font-size-sm;
    text-align: center;
  }
}
</style>
