<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/chat/ConversationList.vue'
import { getOtherUser } from '@/api/utils/chatUtils'
import type { ChatUser, Conversation, ConversationID } from '@/api/types/chat'
import ChatArea from '@/components/chat/ChatArea.vue'
import { useNavigation } from '@/router/utils'
import { createLogger } from '@/utils/logger'

const twoColumnLayout = ref<InstanceType<typeof TwoColumnLayout> | null>(null)
const conversationListRef = ref<InstanceType<typeof ConversationList> | null>(null)
const authStore = useAuthStore()
const { query, removeQuery } = useNavigation()
const logger = createLogger(import.meta.url)

const selectedConversationId = ref<ConversationID | undefined>()
const selectedChatUser = ref<ChatUser | undefined>()

onMounted(async () => {
  const selectedChatUserId = query.userId as string | undefined
  if (selectedChatUserId && selectedChatUserId !== authStore.user?.id) {
    await loadConversation(selectedChatUserId)
    twoColumnLayout.value?.showContent()
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
    await loadUser(userId)
  }
  removeQuery('userId')
}

async function loadUser(userId: string) {
  try {
    const user = await api.users.getUserById(userId)
    selectedChatUser.value = user
  } catch (error) {
    logger.error('Failed to load user:', error)
  }
}

function handleSelectConversation(conversation: Conversation) {
  selectedChatUser.value = getOtherUser(authStore.user!.id, conversation)
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

function handleMessagesRead() {
  conversationListRef.value?.resetUnreadCount()
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
        @read="handleMessagesRead"
      />
    </template>
  </TwoColumnLayout>
</template>
