<script setup lang="ts">
import { ref } from 'vue'
import type { Conversation } from '@/api/types/support'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'

interface Props {
  conversations: Conversation[]
  selectedConversationId?: string
}

defineProps<Props>()

const { locale } = useNavigation()
const authStore = useAuthStore()

const emit = defineEmits<{
  selectConversation: [conversationId: string]
  newConversation: []
}>()

const searchQuery = ref('')

function getConversationAvatar(conversation: Conversation): string {
  const isCurrentUserMember = authStore.user?.id === conversation.memberId
  return isCurrentUserMember ? conversation.organizationAvatar : conversation.memberAvatar
}

function getConversationName(conversation: Conversation): string {
  const isCurrentUserMember = authStore.user?.id === conversation.memberId
  return isCurrentUserMember ? conversation.organizationName : conversation.memberName
}

function isLastMessageFromMe(conversation: Conversation): boolean {
  return authStore.user?.id === conversation.lastMessageSenderId
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Ieri'
  } else if (days < 7) {
    return date.toLocaleDateString(locale.value, { weekday: 'short' })
  } else {
    return date.toLocaleDateString(locale.value, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }
}
</script>

<template>
  <div class="conversation-list">
    <div class="conversation-list-header">
      <h1 class="title">Chat</h1>
      <q-btn round flat icon="add_circle_outline" color="primary" @click="emit('newConversation')">
        <q-tooltip>Nuova conversazione</q-tooltip>
      </q-btn>
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
      <q-item
        v-for="conversation in conversations"
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
            {{ conversation.lastMessage }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption class="message-time">
            {{ formatTime(conversation.lastMessageTime) }}
          </q-item-label>
          <q-badge
            v-if="conversation.unreadCount > 0"
            color="primary"
            rounded
            :label="conversation.unreadCount"
            class="unread-badge"
          />
        </q-item-section>
      </q-item>
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
    background-color: var(--q-selected-color);
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
    margin-top: 4px;
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
</style>
