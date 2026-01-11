<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Conversation, ChatUser } from '@/api/types/chat'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'

interface Props {
  conversations: Conversation[]
  selectedConversationId?: string
  userSearchResults?: ChatUser[]
}

const props = defineProps<Props>()

const { locale } = useNavigation()
const authStore = useAuthStore()

const emit = defineEmits<{
  selectConversation: [conversationId: string]
  selectChatUser: [userId: string]
  search: [query: string]
}>()

const searchQuery = ref('')

function getConversationAvatar(conversation: Conversation): string {
  const isCurrentUserMember = authStore.user?.id === conversation.member.id
  return isCurrentUserMember ? conversation.organization.avatar : conversation.member.avatar
}

function getConversationName(conversation: Conversation): string {
  const isCurrentUserMember = authStore.user?.id === conversation.member.id
  return isCurrentUserMember ? conversation.organization.name : conversation.member.name
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

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.conversations
  }

  const query = searchQuery.value.toLowerCase().trim()
  return props.conversations.filter((conversation) => {
    const name = getConversationName(conversation).toLowerCase()
    const lastMessage = conversation.lastMessage.content.toLowerCase()
    return name.includes(query) || lastMessage.includes(query)
  })
})

// Watch search query and emit to parent
watch(searchQuery, (newQuery) => {
  emit('search', newQuery)
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
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <q-list class="conversations">
      <!-- Show conversations header only if there are also search results -->
      <q-item-label
        v-if="
          searchQuery.trim() &&
          filteredConversations.length > 0 &&
          userSearchResults &&
          userSearchResults.length > 0
        "
        header
        class="search-section-header"
      >
        Conversazioni
      </q-item-label>

      <!-- Show filtered conversations -->
      <q-item
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        clickable
        :active="selectedConversationId === conversation.id"
        class="conversation-item"
        @click="emit('selectConversation', conversation.id)"
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
            v-if="conversation.unreadCount > 0"
            color="primary"
            rounded
            :label="conversation.unreadCount > 999 ? '999+' : conversation.unreadCount"
            class="unread-badge"
          />
        </q-item-section>
      </q-item>

      <!-- Show search results (organizations) after conversations if search is active -->
      <template v-if="searchQuery.trim() && userSearchResults && userSearchResults.length > 0">
        <q-item-label header class="search-section-header">Organizzazioni</q-item-label>
        <q-item
          v-for="user in userSearchResults"
          :key="user.id"
          clickable
          :active="selectedConversationId === user.id"
          class="conversation-item organization-result"
          @click="emit('selectChatUser', user.id)"
        >
          <q-item-section avatar>
            <q-avatar>
              <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="avatar-image" />
              <q-icon v-else name="business" size="md" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="conversation-name">{{ user.name }}</q-item-label>
            <q-item-label caption lines="1" class="last-message">
              {{ user.bio || 'Inizia una conversazione' }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
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

.organization-result {
  background-color: rgba(var(--q-primary-rgb), 0.05);

  &:hover {
    background-color: rgba(var(--q-primary-rgb), 0.1);
  }
}
</style>
