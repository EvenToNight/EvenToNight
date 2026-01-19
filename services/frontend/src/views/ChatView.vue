<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/chat/ConversationList.vue'
import type { ChatUser, Conversation, ConversationID, Message } from '@/api/types/chat'
import type { UserID } from '@/api/types/users'
import MessageInput from '@/components/chat/MessageInput.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
import { useNavigation } from '@/router/utils'
// import type { WebSocket } from '@/api/mock-services/webSocket'
// import { isNewMessageEvent } from '@/api/mock-services/webSocket'
// import type { NewMessageEvent } from '@/api/types/notification'

const twoColumnLayout = ref<InstanceType<typeof TwoColumnLayout> | null>(null)
// const websocket = ref<WebSocket | null>(null)
const authStore = useAuthStore()
const { query, removeQuery } = useNavigation()

const conversations = ref<Conversation[]>([])
const selectedConversationId = ref<ConversationID | undefined>()
const selectedConversation = computed<Conversation | undefined>(() => {
  return conversations.value.find((c) => c.id === selectedConversationId.value)
})
const searchResults = ref<ChatUser[]>([])
const searchResultLimit = 10
const selectedChatUser = ref<ChatUser | undefined>()

const loading = ref(false)
const hasMoreMessages = ref(true)
const messagesLimit = 50
const selectedMessages = ref<Message[]>([])

const loadingMoreMessages = ref(false)

onMounted(async () => {
  await loadConversations()
  // Check for organizationId in query to start new conversation or load existing one
  const selectedChatUserId = query.organizationId as string | undefined
  if (selectedChatUserId) {
    await loadOrganizationConversation(selectedChatUserId)
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

async function loadOrganizationConversation(userId: string) {
  //TODO seach usign API
  const organizationId = authStore.user?.role === 'organization' ? authStore.user!.id : userId
  const memberId = authStore.user?.role === 'organization' ? userId : authStore.user!.id
  const existingConversation = await api.chat.getConversation(organizationId!, memberId!)

  if (existingConversation) {
    selectedChatUser.value =
      authStore.user?.role === 'organization'
        ? existingConversation.member
        : existingConversation.organization
    await handleSelectConversation(existingConversation.id)
  } else {
    await loadUser(organizationId)
  }
  removeQuery('organizationId')
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

async function loadConversations() {
  try {
    loading.value = true
    const response = await api.chat.getConversations(authStore.user!.id, { limit: 50 })
    conversations.value = response.items
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    loading.value = false
  }
  for (const conversation of conversations.value) {
    console.log('Conversation Loaded:', conversation)
  }
}

async function handleSelectConversation(conversationId: string) {
  try {
    loading.value = true
    hasMoreMessages.value = false
    selectedMessages.value = []
    // selectedChatUser.value = undefined
    console.log('Loading messages for conversation:', conversationId)
    const response = await api.chat.getConversationMessages(authStore.user!.id, conversationId, {
      limit: messagesLimit,
      offset: 0,
    })
    console.log('Messages loaded:', response.items)

    selectedMessages.value = response.items
    hasMoreMessages.value = response.hasMore

    const conversation = conversations.value.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
      selectedChatUser.value =
        authStore.user?.role === 'organization' ? conversation.member : conversation.organization
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

async function handleSelectNewConversation(chatUserId: UserID) {
  try {
    loading.value = true
    hasMoreMessages.value = false
    selectedMessages.value = []
    selectedChatUser.value = searchResults.value.find((user) => user.id === chatUserId)
    // Show content in mobile
    twoColumnLayout.value?.showContent()
  } catch (error) {
    console.error('Failed to load conversation messages:', error)
  } finally {
    loading.value = false
  }
}

async function handleSearch(query: string) {
  try {
    loading.value = true
    // TODO: add query param
    const response = await api.chat.searchConversations(authStore.user!.id, query, {
      limit: searchResultLimit,
    })

    console.log('Conversations search response:', response)

    // Separate conversations from organizations
    const foundConversations: Conversation[] = []
    const foundOrganizations: ChatUser[] = []
    response.items.forEach((item) => {
      if ('organization' in item) {
        foundConversations.push(item)
      } else {
        foundOrganizations.push(item)
      }
    })
    // Update conversations list with found conversations
    conversations.value = foundConversations
    searchResults.value = foundOrganizations

    //TODO temprorary fix to filter out organizations already in conversations
    if (query.trim() !== '' && response.items.length < searchResultLimit) {
      const tempChatUsersSearch = await api.users.searchUsers({
        name: query,
        pagination: { limit: searchResultLimit - foundConversations.length },
        role: authStore.user?.role === 'organization' ? 'member' : 'organization',
      })
      const conversationRecipientIds = new Set(
        foundConversations.map((c) =>
          authStore.user?.role === 'organization' ? c.member.id : c.organization.id
        )
      )

      searchResults.value = tempChatUsersSearch.items.filter(
        (user) => !conversationRecipientIds.has(user.id)
      )
    }
  } catch (error) {
    console.error('Failed to search organizations:', error)
    searchResults.value = []
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
  console.log('ayo')
  console.log('Conversation before before send:', { ...conversations.value })

  if (!content.trim()) return
  if (!selectedConversationId.value) {
    //create conversation
    const response = await api.chat.startConversation(authStore.user!.id, {
      recipientId: selectedChatUser.value!.id,
      content: content.trim(),
    })
    // Reload conversations to get the new one

    await loadConversations()
    selectedConversationId.value = response.conversationId
    selectedMessages.value.push({
      ...response,
      isRead: false,
    })

    // Move new conversation to top of list
    const conversationIndex = conversations.value.findIndex((c) => c.id === response.conversationId)
    if (conversationIndex !== -1 && conversationIndex !== 0) {
      const conversation = conversations.value[conversationIndex]
      if (conversation) {
        conversations.value.splice(conversationIndex, 1)
        conversations.value.unshift(conversation)
      }
    }
  } else {
    //send message to existing conversation
    console.log('Conversation before send:', { ...conversations.value })

    console.log('Sending message to existing conversation')
    const response = await api.chat.sendMessage(
      authStore.user!.id,
      selectedConversationId.value!,
      content.trim()
    )
    console.log('Message sent, updating messages and conversation list', response)

    selectedMessages.value.push({
      ...response,
      isRead: false,
    })

    // Update conversation's last message in the list and move to top
    const conversationIndex = conversations.value.findIndex(
      (c) => c.id === selectedConversationId.value
    )
    if (conversationIndex !== -1) {
      const conversation = conversations.value[conversationIndex]
      if (conversation) {
        console.log('Updating conversation last message and moving to top')
        conversation.lastMessage = {
          senderId: response.senderId,
          content: response.content,
          createdAt: response.createdAt,
        }
        console.log('Conversation before moving:', { ...conversations.value })
        // Move conversation to top of list
        conversations.value.splice(conversationIndex, 1)
        conversations.value.unshift(conversation)
      }
    }
  }
}

// try {
//   // If this is a new conversation with an organization, create it first
//   if (isNewConversation.value && selectedOrganization.value) {
//     const response = await api.chat.startConversation(authStore.user.id, {
//       recipientId: selectedOrganization.value.id,
//       content: content.trim(),
//     })

//     // Select the new conversation
//     selectedConversationId.value = response.conversationId

//     isNewConversation.value = false
//     selectedOrganization.value = undefined

//     // Load messages for the new conversation
//     const messagesResponse = await api.chat.getConversationMessages(
//       authStore.user.id,
//       response.conversationId,
//       {
//         limit: messagesLimit,
//         offset: 0,
//       }
//     )
//     selectedMessages.value = messagesResponse.items
//   } else {
//     // Send message to existing conversation
//     const response = await api.chat.sendMessage(
//       authStore.user.id,
//       selectedConversationId.value!,
//       content.trim()
//     )

//     selectedMessages.value.push({
//       ...response,
//       isRead: false,
//     })

//     // Update conversation's last message in the list and move to top
//     const conversationIndex = conversations.value.findIndex(
//       (c) => c.id === selectedConversationId.value
//     )
//     if (conversationIndex !== -1) {
//       const conversation = conversations.value[conversationIndex]
//       if (conversation) {
//         conversation.lastMessage = {
//           senderId: response.senderId,
//           content: response.content,
//           createdAt: response.createdAt,
//         }
//         // Move conversation to top of list
//         conversations.value.splice(conversationIndex, 1)
//         conversations.value.unshift(conversation)
//       }
//     }
//   }
// } catch (error) {
//   console.error('Failed to send message:', error)
// }
// }

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
        :conversations="conversations"
        :selected-conversation-id="selectedConversationId"
        :user-search-results="searchResults"
        @select-conversation="handleSelectConversation"
        @select-chat-user="handleSelectNewConversation"
        @search="handleSearch"
      />
    </template>
    <template #content>
      <div class="chat-content">
        <ChatArea
          :selected-chat-user="selectedChatUser"
          :conversation="selectedConversation"
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
