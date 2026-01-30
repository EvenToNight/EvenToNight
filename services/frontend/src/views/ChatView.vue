<!-- 
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
// const websocket = ref<WebSocket | null>(null)

// onMounted(async () => {
//   const selectedChatUserId = query.userId as string | undefined
//   if (selectedChatUserId && selectedChatUserId !== authStore.user?.id) {
//     await loadConversation(selectedChatUserId)
//   } else if (selectedChatUserId) {
//     removeQuery('userId')
//   }

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
// })

// onUnmounted(() => {
//   if (websocket.value) {
//     websocket.value.disconnect()
//   }
// })

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
</script> -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/chat/ConversationList.vue'
import type { ChatUser, Conversation, ConversationID } from '@/api/types/chat'
import ChatArea from '@/components/chat/ChatArea.vue'
import { useNavigation } from '@/router/utils'

const twoColumnLayout = ref<InstanceType<typeof TwoColumnLayout> | null>(null)
const conversationListRef = ref<InstanceType<typeof ConversationList> | null>(null)
const authStore = useAuthStore()
const { query, removeQuery } = useNavigation()

const selectedConversationId = ref<ConversationID | undefined>()
const selectedChatUser = ref<ChatUser | undefined>()

onMounted(async () => {
  const selectedChatUserId = query.userId as string | undefined
  if (selectedChatUserId && selectedChatUserId !== authStore.user?.id) {
    await loadConversation(selectedChatUserId)
  } else if (selectedChatUserId) {
    removeQuery('userId')
  }
})

async function loadConversation(userId: string) {
  const organizationId = authStore.user?.role === 'organization' ? authStore.user!.id : userId
  const memberId = authStore.user?.role === 'organization' ? userId : authStore.user!.id
  const existingConversation = await api.chat.getConversationBetween(organizationId, memberId)

  if (existingConversation) {
    selectedChatUser.value =
      authStore.user?.role === 'organization'
        ? existingConversation.member
        : existingConversation.organization
    selectedConversationId.value = existingConversation.id
  } else {
    // No existing conversation, load user to start a new one
    await loadUser(userId)
  }
  removeQuery('userId')
}

async function loadUser(userId: string) {
  try {
    const user = await api.users.getUserById(userId)
    selectedChatUser.value = user
  } catch (error) {
    console.error('Failed to load user:', error)
  }
}

function handleSelectConversation(conversation: Conversation) {
  selectedChatUser.value = conversationListRef.value?.getOtherUser(conversation)
  selectedConversationId.value = conversation.id
  twoColumnLayout.value?.showContent()
}

function handleSelectNewConversation(chatUser: ChatUser) {
  selectedConversationId.value = undefined
  selectedChatUser.value = chatUser
  twoColumnLayout.value?.showContent()
}

function handleBackToList() {
  selectedConversationId.value = undefined
  selectedChatUser.value = undefined
  twoColumnLayout.value?.showSidebar()
}

function handleConversationCreated(conversation: Conversation) {
  conversationListRef.value?.addNewConversation(conversation)
}

function handleMessageSent(
  conversationId: string,
  lastMessage: { senderId: string; content: string; createdAt: Date }
) {
  conversationListRef.value?.updateConversationLastMessage(conversationId, lastMessage)
}
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
      <ChatArea
        v-model:selected-conversation-id="selectedConversationId"
        :selected-chat-user="selectedChatUser"
        @back="handleBackToList"
        @conversation-created="handleConversationCreated"
        @message-sent="handleMessageSent"
      />
    </template>
  </TwoColumnLayout>
</template>

<style scoped lang="scss">
// Styles removed - ChatArea now handles its own layout
</style>
