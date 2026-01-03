<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import ConversationList from '@/components/support/ConversationList.vue'
import type { Conversation, Message } from '@/api/types/support'
import type { User } from '@/api/types/users'
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
const searchResults = ref<User[]>([])
const selectedOrganization = ref<User | undefined>()
const isNewConversation = ref(false)

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
