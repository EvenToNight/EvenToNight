<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/support/ConversationList.vue'
import type { Conversation, Message } from '@/api/types/support'
import MessageInput from '@/components/support/MessageInput.vue'

const authStore = useAuthStore()
const conversations = ref<Conversation[]>([])
const selectedConversationId = ref<string>()
const selectedMessages = ref<Message[]>([])
const loading = ref(false)

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
  selectedMessages.value = (await api.support.getConversationMessages(conversationId)).items
  const conversation = conversations.value.find(
    (conversation) => conversation.id === conversationId
  )
  if (conversation) {
    conversation.unreadCount = 0
  }
  selectedConversationId.value = conversationId
}

function handleNewConversation() {}

function handleSendMessage(_content: string) {}
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
        <MessageInput v-if="selectedConversationId" @send-message="handleSendMessage" />
      </div>
    </template>

    <template #mobile-title>
      <h3 v-if="selectedConversationId" class="mobile-conversation-title">
        {{ conversations.find((c) => c.id === selectedConversationId)?.organizationName }}
      </h3>
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
