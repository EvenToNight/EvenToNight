<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/support/ConversationList.vue'
import type { Conversation } from '@/api/types/support'

const authStore = useAuthStore()
const conversations = ref<Conversation[]>([])
const selectedConversationId = ref<string>()
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
  await api.support.getConversationMessages(conversationId)
  const conversation = conversations.value.find(
    (conversation) => conversation.id === conversationId
  )
  if (conversation) {
    conversation.unreadCount = 0
  }
  selectedConversationId.value = conversationId
}

function handleNewConversation() {}
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
  </TwoColumnLayout>
</template>
