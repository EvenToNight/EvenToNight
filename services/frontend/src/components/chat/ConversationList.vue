<script setup lang="ts">
import { ref } from 'vue'
import type { ChatUser, Conversation } from '@/api/types/chat'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'

const { locale } = useNavigation()
const authStore = useAuthStore()
const conversations = ref<Conversation[]>([])
const potentialConversations = ref<Conversation[]>([])
const selectedConversationId = defineModel<string | undefined>('selectedConversationId', {
  default: undefined,
})
const searchQuery = ref('')
const loading = ref(true)
const hasMore = ref(true)
const offset = ref(0)
const LIMIT = 20

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const emit = defineEmits<{
  selectConversation: [conversation: Conversation]
  selectChatUser: [user: ChatUser]
}>()

function getConversationAvatar(conversation: Conversation): string {
  const isCurrentUserMember = authStore.user?.id === conversation.member.id
  return isCurrentUserMember ? conversation.organization.avatar : conversation.member.avatar
}

function getConversationName(conversation: Conversation): string {
  const isCurrentUserMember = authStore.user?.id === conversation.member.id
  return isCurrentUserMember ? conversation.organization.name : conversation.member.name
}

function getOtherUser(conversation: Conversation): ChatUser {
  const isCurrentUserMember = authStore.user?.id === conversation.member.id
  return isCurrentUserMember ? conversation.organization : conversation.member
}

function handleSelectConversation(conversation: Conversation) {
  conversation.unreadCount = 0
  selectedConversationId.value = conversation.id
  emit('selectConversation', conversation)
}

function isLastMessageFromMe(conversation: Conversation): boolean {
  return authStore.user?.id === conversation.lastMessage.senderId
}

function formatTime(date: Date | undefined): string {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return dateObj.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Ieri'
  } else if (days < 7) {
    return dateObj.toLocaleDateString(locale.value, { weekday: 'short' })
  } else {
    return dateObj.toLocaleDateString(locale.value, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }
}

async function loadConversations(reset = false) {
  try {
    if (reset) {
      loading.value = true
      offset.value = 0
      conversations.value = []
      potentialConversations.value = []
      searchQuery.value = ''
    }
    const response = await api.chat.getConversations(authStore.user!.id, {
      limit: LIMIT,
      offset: offset.value,
    })
    conversations.value = [...conversations.value, ...response.items]
    hasMore.value = response.hasMore
    offset.value += response.items.length
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    loading.value = false
  }
}

async function searchConversations(query: string) {
  try {
    loading.value = true
    offset.value = 0
    const response = await api.chat.searchConversations(authStore.user!.id, query, { limit: LIMIT })
    conversations.value = response.items.filter((c) => c.id)
    potentialConversations.value = response.items.filter((c) => !c.id)
    hasMore.value = response.hasMore
    offset.value = response.items.length
  } catch (error) {
    console.error('Failed to search conversations:', error)
  } finally {
    loading.value = false
  }
}

async function onLoadMore(_index: number, done: (stop?: boolean) => void) {
  if (searchQuery.value.trim()) {
    done(true)
    return
  }
  try {
    const response = await api.chat.getConversations(authStore.user!.id, {
      limit: LIMIT,
      offset: offset.value,
    })
    conversations.value = [...conversations.value, ...response.items]
    hasMore.value = response.hasMore
    offset.value += response.items.length
    done(!response.hasMore)
  } catch (error) {
    console.error('Failed to load more conversations:', error)
    done(true)
  }
}

function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    if (searchQuery.value.trim()) {
      searchConversations(searchQuery.value.trim())
    } else {
      loadConversations(true)
    }
  }, 300)
}

// Exposed functions for parent component
function updateConversationLastMessage(
  conversationId: string,
  lastMessage: { senderId: string; content: string; createdAt: Date }
) {
  const index = conversations.value.findIndex((c) => c.id === conversationId)
  if (index !== -1) {
    const conversation = conversations.value[index]
    if (conversation) {
      conversation.lastMessage = lastMessage
      conversation.unreadCount = 0 // Reset since we're sending
      // Move to top
      conversations.value.splice(index, 1)
      conversations.value.unshift(conversation)
    }
  }
}

function addOrMoveConversationToTop(conversationId: string) {
  const index = conversations.value.findIndex((c) => c.id === conversationId)
  if (index !== -1 && index !== 0) {
    const conversation = conversations.value[index]
    if (conversation) {
      conversations.value.splice(index, 1)
      conversations.value.unshift(conversation)
    }
  }
}

function addNewConversation(conversation: Conversation) {
  // Clear search if active
  if (searchQuery.value.trim()) {
    searchQuery.value = ''
    potentialConversations.value = []
  }
  // Add to top of list
  conversations.value.unshift(conversation)
}

defineExpose({
  loadConversations,
  updateConversationLastMessage,
  addOrMoveConversationToTop,
  addNewConversation,
  getOtherUser,
})
</script>

<template>
  <div class="conversation-list">
    <div class="conversation-list-header">
      <h1 class="title">Chat</h1>
    </div>

    <div class="search-box">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Cerca o inizia una nuova chat"
        class="search-input"
        @update:model-value="onSearchInput"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <q-infinite-scroll class="conversations" :offset="250" @load="onLoadMore">
      <q-list>
        <!-- Show conversations header only if searching -->
        <q-item-label
          v-if="searchQuery.trim() && conversations.length > 0"
          header
          class="search-section-header"
        >
          Conversazioni
        </q-item-label>

        <!-- Show conversations -->
        <q-item
          v-for="conversation in conversations"
          :key="conversation.id"
          clickable
          :active="selectedConversationId === conversation.id"
          class="conversation-item"
          @click="handleSelectConversation(conversation)"
        >
          <q-item-section avatar>
            <q-avatar>
              <img
                :src="getConversationAvatar(conversation)"
                :alt="getConversationName(conversation)"
                class="avatar-image"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="conversation-name">
              {{ getConversationName(conversation) }}
            </q-item-label>
            <q-item-label caption lines="1" class="last-message">
              <span v-if="isLastMessageFromMe(conversation)" class="message-prefix">Tu: </span>
              {{ conversation.lastMessage.content }}
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption class="message-time">
              {{ formatTime(conversation.lastMessage.createdAt) }}
            </q-item-label>
            <q-badge
              v-if="conversation.unreadCount > 0 && !isLastMessageFromMe(conversation)"
              color="primary"
              rounded
              :label="conversation.unreadCount > 999 ? '999+' : conversation.unreadCount"
              class="unread-badge"
            />
          </q-item-section>
        </q-item>

        <!-- Show potential new conversations -->
        <template v-if="searchQuery.trim() && potentialConversations.length > 0">
          <q-item-label header class="search-section-header">
            Inizia una conversazione
          </q-item-label>
          <q-item
            v-for="conv in potentialConversations"
            :key="getOtherUser(conv).id"
            clickable
            class="conversation-item potential-conversation"
            @click="emit('selectChatUser', getOtherUser(conv))"
          >
            <q-item-section avatar>
              <q-avatar>
                <img
                  :src="getConversationAvatar(conv)"
                  :alt="getConversationName(conv)"
                  class="avatar-image"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="conversation-name">
                {{ getConversationName(conv) }}
              </q-item-label>
              <q-item-label caption lines="1" class="last-message">
                Inizia una conversazione
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </div>
</template>

<style scoped lang="scss">
.conversation-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--q-background);
  overflow: hidden;
}

.conversation-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--q-primary);
  color: white;

  .title {
    color: white;
    margin: 0;
    line-height: 1.2;
    font-size: 20px;
    font-weight: 500;
  }
}

.search-box {
  padding: 8px 12px;
  background-color: var(--q-background);
  border-bottom: 1px solid var(--q-separator-color);

  .search-input {
    border-radius: 20px;
  }
}

.conversations {
  flex: 1;
  overflow-y: auto;
  padding: 0;

  :deep(.q-list) {
    padding: 0;
  }
}

.conversation-item {
  border-bottom: 1px solid var(--q-separator-color);
  padding: 12px 16px;
  min-height: 72px;

  &:hover {
    background-color: var(--q-hover-color);
  }

  &.q-item--active {
    background-color: rgba(var(--q-primary-rgb), 0.15) !important;
    border-left: 3px solid var(--q-primary);
    padding-left: 13px;
  }

  .conversation-name {
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 2px;
  }

  .last-message {
    color: var(--q-text-secondary);
    font-size: 14px;
  }

  .message-time {
    font-size: 12px;
    color: var(--q-text-secondary);
    margin-bottom: 4px;
  }

  .unread-badge {
    color: white;
    margin-top: 4px;
    border-radius: 12px;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.q-field__control) {
  border-radius: 20px;
}

.search-section-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--q-text-secondary);
  text-transform: uppercase;
  padding: 12px 16px 8px;
  background-color: var(--q-background);
}

.potential-conversation {
  background-color: rgba(var(--q-primary-rgb), 0.05);

  &:hover {
    background-color: rgba(var(--q-primary-rgb), 0.1);
  }
}
</style>
