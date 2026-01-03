<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/support/ConversationList.vue'
import type { Conversation, Message } from '@/api/types/support'
import MessageInput from '@/components/support/MessageInput.vue'
import ChatArea from '@/components/support/ChatArea.vue'

const authStore = useAuthStore()
const conversations = ref<Conversation[]>([])
const selectedConversationId = ref<string>()
const selectedMessages = ref<Message[]>([])
const loading = ref(false)
const loadingMoreMessages = ref(false)
const hasMoreMessages = ref(true)
const messagesLimit = 50

const selectedConversation = computed<Conversation | undefined>(() => {
  return conversations.value.find((c) => c.id === selectedConversationId.value)
})

onMounted(async () => {
  await loadConversations()
})

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

async function handleSelectConversation(conversationId: string) {
  try {
    loading.value = true
    hasMoreMessages.value = true
    selectedMessages.value = []

    const response = await api.support.getConversationMessages(conversationId, {
      limit: messagesLimit,
      offset: 0,
    })

    selectedMessages.value = response.items
    hasMoreMessages.value = response.hasMore

    const conversation = conversations.value.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
    selectedConversationId.value = conversationId
  } catch (error) {
    console.error('Failed to load conversation messages:', error)
  } finally {
    loading.value = false
  }
}

function handleNewConversation() {}

function handleBackToList() {
  selectedConversationId.value = undefined
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

    await api.support.sendMessage(selectedConversationId.value, newMessage)
    selectedMessages.value.push(newMessage)

    // Update conversation's last message in the list
    const conversation = conversations.value.find((c) => c.id === selectedConversationId.value)
    if (conversation) {
      conversation.lastMessage = content.trim()
      conversation.lastMessageTime = newMessage.timestamp
      conversation.lastMessageSenderId = newMessage.senderId
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}
</script>

<template>
  <TwoColumnLayout>
    <template #sidebar>
      <ConversationList
        :conversations="conversations"
        :selected-conversation-id="selectedConversationId"
        @select-conversation="handleSelectConversation"
        @new-conversation="handleNewConversation"
      />
    </template>
    <template #content>
      <div class="chat-content">
        <ChatArea
          :conversation="selectedConversation"
          :messages="selectedMessages"
          @back="handleBackToList"
          @load-more="handleLoadMoreMessages"
        />
        <MessageInput v-if="selectedConversationId" @send-message="handleSendMessage" />
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
