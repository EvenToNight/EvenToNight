<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/chat/ConversationList.vue'
import type { ChatUser, Conversation, ConversationID, Message } from '@/api/types/chat'
import MessageInput from '@/components/chat/MessageInput.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
import { useNavigation } from '@/router/utils'
// import type { WebSocket } from '@/api/mock-services/webSocket'
// import { isNewMessageEvent } from '@/api/mock-services/webSocket'
// import type { NewMessageEvent } from '@/api/types/notification'

const twoColumnLayout = ref<InstanceType<typeof TwoColumnLayout> | null>(null)
const conversationListRef = ref<InstanceType<typeof ConversationList> | null>(null)
// const websocket = ref<WebSocket | null>(null)
const authStore = useAuthStore()
const { query, removeQuery } = useNavigation()

const selectedConversationId = ref<ConversationID | undefined>()
const selectedChatUser = ref<ChatUser | undefined>()

const loading = ref(false)
const hasMoreMessages = ref(true)
const messagesLimit = 50
const selectedMessages = ref<Message[]>([])

const loadingMoreMessages = ref(false)

onMounted(async () => {
  const selectedChatUserId = query.userId as string | undefined
  if (selectedChatUserId && selectedChatUserId !== authStore.user?.id) {
    await loadConversation(selectedChatUserId)
  } else if (selectedChatUserId) {
    removeQuery('userId')
  }

  // // Initialize WebSocket for real-time updates
  // if (authStore.user?.id) {
  //   console.log('[SupportView] Initializing WebSocket for user:', authStore.user.id)
  //   websocket.value = api.notification.createWebSocket(authStore.user.id)
  //   websocket.value.connect()
  //   // Listen for new messages from other tabs
  //   websocket.value.on(async (event) => {
  //     console.log('[SupportView] WebSocket event received:', event)
  //     if (isNewMessageEvent(event)) {
  //       console.log('[SupportView] Handling new message event')
  //       handleWebSocketNewMessage(event)
  //     }
  //   })
  // }
})

// onUnmounted(() => {
//   if (websocket.value) {
//     websocket.value.disconnect()
//   }
// })

async function loadConversation(userId: string) {
  const organizationId = authStore.user?.role === 'organization' ? authStore.user!.id : userId
  const memberId = authStore.user?.role === 'organization' ? userId : authStore.user!.id
  const existingConversation = await api.chat.getConversation(organizationId, memberId)

  if (existingConversation) {
    selectedChatUser.value =
      authStore.user?.role === 'organization'
        ? existingConversation.member
        : existingConversation.organization

    selectedConversationId.value = existingConversation.id
    try {
      loading.value = true
      const response = await api.chat.getConversationMessages(
        authStore.user!.id,
        existingConversation.id,
        {
          limit: messagesLimit,
          offset: 0,
        }
      )
      selectedMessages.value = response.items
      hasMoreMessages.value = response.hasMore
    } catch (error) {
      console.error('Failed to load conversation messages:', error)
    } finally {
      loading.value = false
    }
  } else {
    // No existing conversation, load user to start a new one
    await loadUser(userId)
  }
  removeQuery('userId')
}

async function loadUser(userId: string) {
  try {
    loading.value = true
    const user = await api.users.getUserById(userId)
    selectedChatUser.value = user
  } catch (error) {
    console.error('Failed to load user:', error)
  } finally {
    loading.value = false
  }
}

async function handleSelectConversation(conversation: Conversation) {
  try {
    loading.value = true
    hasMoreMessages.value = false
    selectedMessages.value = []

    // Set the other user from the conversation
    selectedChatUser.value = conversationListRef.value?.getOtherUser(conversation)

    const response = await api.chat.getConversationMessages(authStore.user!.id, conversation.id, {
      limit: messagesLimit,
      offset: 0,
    })

    selectedMessages.value = response.items
    hasMoreMessages.value = response.hasMore

    // Show content in mobile
    twoColumnLayout.value?.showContent()
  } catch (error) {
    console.error('Failed to load conversation messages:', error)
  } finally {
    loading.value = false
  }
}

async function handleSelectNewConversation(chatUser: ChatUser) {
  try {
    loading.value = true
    hasMoreMessages.value = false
    selectedMessages.value = []
    selectedConversationId.value = undefined // Reset - it's a new conversation
    selectedChatUser.value = chatUser
    // Show content in mobile
    twoColumnLayout.value?.showContent()
  } catch (error) {
    console.error('Failed to start new conversation:', error)
  } finally {
    loading.value = false
  }
}

function handleBackToList() {
  selectedConversationId.value = undefined
  selectedChatUser.value = undefined
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
    const response = await api.chat.getConversationMessages(
      authStore.user!.id,
      selectedConversationId.value,
      {
        limit: messagesLimit,
        offset: selectedMessages.value.length,
      }
    )

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
  if (!content.trim()) return

  if (!selectedConversationId.value) {
    // Create new conversation
    const response = await api.chat.startConversation(authStore.user!.id, {
      recipientId: selectedChatUser.value!.id,
      content: content.trim(),
    })

    selectedConversationId.value = response.conversationId
    selectedMessages.value.push({
      ...response,
      isRead: false,
    })

    // Build conversation object and add to top of list
    const isCurrentUserOrganization = authStore.user?.role === 'organization'
    const currentUserAsChatUser: ChatUser = {
      id: authStore.user!.id,
      name: authStore.user!.name,
      username: authStore.user!.username,
      avatar: authStore.user!.avatar,
    }
    const newConversation: Conversation = {
      id: response.conversationId,
      organization: isCurrentUserOrganization ? currentUserAsChatUser : selectedChatUser.value!,
      member: isCurrentUserOrganization ? selectedChatUser.value! : currentUserAsChatUser,
      lastMessage: {
        senderId: response.senderId,
        content: response.content,
        createdAt: response.createdAt,
      },
      unreadCount: 0,
    }
    conversationListRef.value?.addNewConversation(newConversation)
  } else {
    // Send message to existing conversation
    const response = await api.chat.sendMessage(
      authStore.user!.id,
      selectedConversationId.value!,
      content.trim()
    )

    selectedMessages.value.push({
      ...response,
      isRead: false,
    })

    // Update conversation's last message and move to top
    conversationListRef.value?.updateConversationLastMessage(selectedConversationId.value, {
      senderId: response.senderId,
      content: response.content,
      createdAt: response.createdAt,
    })
  }
}

// function handleWebSocketNewMessage(event: NewMessageEvent) {
//   console.log('[SupportView] handleWebSocketNewMessage called:', event)
//   const { message, conversation: updatedConversation } = event.data

//   // Sync message to localStorage (for cross-tab persistence)
//   // syncWebSocketMessage(message, updatedConversation, authStore.user?.id)

//   // Check if the message is from the current user (sent from another tab)
//   const isOwnMessage = message.senderId === authStore.user?.id
//   console.log('[SupportView] Message is from current user:', isOwnMessage)

//   // Update or add conversation in the list
//   const existingConversationIndex = conversations.value.findIndex(
//     (c) => c.id === event.conversationId
//   )
//   console.log('[SupportView] Existing conversation index:', existingConversationIndex)

//   if (existingConversationIndex !== -1) {
//     // Update existing conversation
//     const conv = conversations.value[existingConversationIndex]
//     if (conv) {
//       conversations.value[existingConversationIndex] = updatedConversation

//       // // Increment unread count only if it's not the currently selected conversation
//       // // and the message is not from the current user
//       // if (selectedConversationId.value !== event.conversationId && !isOwnMessage) {
//       //   conversations.value[existingConversationIndex].unreadCount += 1
//       // }

//       // Move conversation to top of list
//       conversations.value.splice(existingConversationIndex, 1)
//       conversations.value.unshift(updatedConversation)
//     }
//   } else {
//     // Add new conversation to list (if it doesn't exist)
//     conversations.value.unshift(updatedConversation)
//   }
//   // If this message belongs to the currently selected conversation, add it to messages
//   if (selectedConversationId.value === event.conversationId) {
//     // Check if message already exists (to avoid duplicates)
//     const messageExists = selectedMessages.value.some((m) => m.id === message.id)
//     if (!messageExists) {
//       selectedMessages.value.push(message)
//     }

//     // Mark messages as read since the conversation is currently open
//     if (authStore.user?.id) {
//       // Find the conversation again since it might have moved in the list
//       const conv = conversations.value.find((c) => c.id === event.conversationId)
//       if (conv) {
//         conv.unreadCount = 0
//       }
//       api.chat.readConversationMessages(event.conversationId, authStore.user.id)
//     }
//   }
// }
</script>

<template>
  <TwoColumnLayout ref="twoColumnLayout">
    <template #sidebar>
      <ConversationList
        ref="conversationListRef"
        v-model:selected-conversation-id="selectedConversationId"
        @select-conversation="handleSelectConversation"
        @select-chat-user="handleSelectNewConversation"
      />
    </template>
    <template #content>
      <div class="chat-content">
        <ChatArea
          :selected-chat-user="selectedChatUser"
          :messages="selectedMessages"
          @back="handleBackToList"
          @load-more="handleLoadMoreMessages"
        />
        <MessageInput v-if="selectedChatUser" @send-message="handleSendMessage" />
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
