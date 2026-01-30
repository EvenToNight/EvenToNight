<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import type { ConversationID, Message, ChatUser, Conversation } from '@/api/types/chat'
import ChatHeader from './ChatHeader.vue'
import MessageInput from './MessageInput.vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { useQuasar } from 'quasar'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import type { NewMessageReceivedEvent } from '@/api/types/notifications'

const props = defineProps<{
  selectedChatUser?: ChatUser
}>()

const selectedConversationId = defineModel<ConversationID | undefined>('selectedConversationId', {
  default: undefined,
})

const emit = defineEmits<{
  back: []
  conversationCreated: [conversation: Conversation]
  messageSent: [
    conversationId: string,
    lastMessage: { senderId: string; content: string; createdAt: Date },
  ]
}>()

const messagesContainer = ref<HTMLElement | null>(null)
const autoScroll = ref(true)
const messages = ref<Message[]>([])
const loading = ref(false)
const hasMoreMessages = ref(true)
const loadingMoreMessages = ref(false)
const messagesLimit = 50

const authStore = useAuthStore()
const $q = useQuasar()
const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)
const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)

function isFromCurrentUser(message: Message): boolean {
  return message.senderId === authStore.user?.id
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function formatDateSeparator(date: Date): string {
  const now = new Date()
  const messageDate = new Date(date)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

  if (msgDate.getTime() === today.getTime()) {
    return 'Oggi'
  } else if (msgDate.getTime() === yesterday.getTime()) {
    return 'Ieri'
  } else {
    return messageDate.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
}

function shouldShowDateSeparator(index: number): boolean {
  if (index === 0) return true
  const currentMsg = messages.value[index]
  const prevMsg = messages.value[index - 1]
  if (!currentMsg || !prevMsg) return false

  const currentDate = new Date(currentMsg.createdAt)
  const prevDate = new Date(prevMsg.createdAt)

  const currentDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  )
  const prevDay = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate())
  return currentDay.getTime() !== prevDay.getTime()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function onContainerScroll() {
  const el = messagesContainer.value
  if (!el) return

  const tolerance = 48
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - tolerance
  autoScroll.value = atBottom

  const nearTop = el.scrollTop < 200
  if (
    nearTop &&
    !loadingMoreMessages.value &&
    hasMoreMessages.value &&
    selectedConversationId.value
  ) {
    loadMoreMessages()
  }
}

async function loadMessages() {
  if (!selectedConversationId.value) {
    messages.value = []
    return
  }

  try {
    loading.value = true
    hasMoreMessages.value = false
    messages.value = []

    const response = await api.chat.getConversationMessages(
      authStore.user!.id,
      selectedConversationId.value,
      {
        limit: messagesLimit,
        offset: 0,
      }
    )

    messages.value = response.items
    hasMoreMessages.value = response.hasMore
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load conversation messages:', error)
  } finally {
    loading.value = false
  }
}

async function loadMoreMessages() {
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
        offset: messages.value.length,
      }
    )

    messages.value = [...response.items, ...messages.value]
    hasMoreMessages.value = response.hasMore
  } catch (error) {
    console.error('Failed to load more messages:', error)
  } finally {
    loadingMoreMessages.value = false
  }
}

async function handleSendMessage(content: string) {
  if (!content.trim()) return

  if (!selectedConversationId.value) {
    // Create new conversation
    const response = await api.chat.startConversation(authStore.user!.id, {
      recipientId: props.selectedChatUser!.id,
      content: content.trim(),
    })

    selectedConversationId.value = response.conversationId
    messages.value.push({
      ...response,
      isRead: false,
    })

    // Build conversation object and emit
    const isCurrentUserOrganization = authStore.user?.role === 'organization'
    const currentUserAsChatUser: ChatUser = {
      id: authStore.user!.id,
      name: authStore.user!.name,
      username: authStore.user!.username,
      avatar: authStore.user!.avatar,
    }
    const newConversation: Conversation = {
      id: response.conversationId,
      organization: isCurrentUserOrganization ? currentUserAsChatUser : props.selectedChatUser!,
      member: isCurrentUserOrganization ? props.selectedChatUser! : currentUserAsChatUser,
      lastMessage: {
        senderId: response.senderId,
        content: response.content,
        createdAt: response.createdAt,
      },
      unreadCount: 0,
    }
    emit('conversationCreated', newConversation)
  } else {
    // Send message to existing conversation
    const response = await api.chat.sendMessage(
      authStore.user!.id,
      selectedConversationId.value,
      content.trim()
    )

    messages.value.push({
      ...response,
      isRead: false,
    })

    // Emit for conversation list update
    emit('messageSent', selectedConversationId.value, {
      senderId: response.senderId,
      content: response.content,
      createdAt: response.createdAt,
    })
  }

  scrollToBottom()
}

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', onContainerScroll, { passive: true })
  }
  if (selectedConversationId.value) {
    loadMessages()
  }
  console.log('ChatArea mounted')
  const newMessageHandler = (event: NewMessageReceivedEvent) => {
    const {
      conversationId,
      senderId,
      /*senderName, senderAvatar,*/ messageId,
      message,
      createdAt,
    } = event

    if (selectedConversationId.value === conversationId) {
      if (messages.value.some((m) => m.id === messageId)) {
        return
      }
      messages.value.push({
        id: messageId,
        conversationId: conversationId,
        senderId: senderId,
        content: message,
        createdAt: new Date(createdAt),
        isRead: false,
      })
      api.chat.readConversationMessages(conversationId, authStore.user!.id)
      if (autoScroll.value) {
        scrollToBottom()
      }
    }
  }
  api.notifications.onNewMessageReceived(newMessageHandler)
  onUnmounted(() => {
    console.log('ChatArea unmounted')
    api.notifications.offNewMessageReceived(newMessageHandler)
  })
})

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', onContainerScroll)
  }
})

// Watch conversation changes to load messages
watch(selectedConversationId, (newId, oldId) => {
  if (newId !== oldId) {
    loadMessages()
  }
})

// Watch messages and autoscroll
watch(
  messages,
  () => {
    if (autoScroll.value) {
      scrollToBottom()
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="chat-area">
    <div v-if="!selectedChatUser" class="empty-state">
      <q-icon name="chat_bubble_outline" size="120px" color="grey-5" />
      <h3>Seleziona una conversazione</h3>
      <p>Scegli una chat dalla lista o inizia una nuova conversazione</p>
    </div>

    <template v-else>
      <ChatHeader
        :selected-chat-user="selectedChatUser"
        :show-back-button="isMobile"
        @back="emit('back')"
      />

      <div ref="messagesContainer" class="messages-container">
        <div v-if="loading" class="loading-messages">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else-if="messages.length === 0" class="empty-messages">
          <q-icon name="chat" size="80px" color="grey-4" />
          <p>Nessun messaggio ancora</p>
          <span>Inizia la conversazione scrivendo un messaggio</span>
        </div>

        <template v-else>
          <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
            <div v-if="shouldShowDateSeparator(index)" class="date-separator">
              <span>{{ formatDateSeparator(message.createdAt) }}</span>
            </div>

            <div
              class="message-bubble"
              :class="{
                'message-sent': isFromCurrentUser(message),
                'message-received': !isFromCurrentUser(message),
              }"
            >
              <div class="message-content">
                {{ message.content }}
              </div>
              <div class="message-time">
                {{ formatTime(message.createdAt) }}
                <q-icon
                  v-if="isFromCurrentUser(message)"
                  name="done_all"
                  size="16px"
                  class="read-icon"
                />
              </div>
            </div>
          </div>
        </template>
      </div>

      <MessageInput @send-message="handleSendMessage" />
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/variables' as *;

.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-color: $color-background-mute;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--q-text-secondary);
  text-align: center;
  padding: 0 20px;

  h3 {
    margin: 20px 0 10px;
    font-size: 24px;
    font-weight: 400;
    color: var(--q-text-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--q-text-secondary);
  text-align: center;

  p {
    margin: 16px 0 8px;
    font-size: 18px;
    font-weight: 500;
    color: var(--q-text-primary);
  }

  span {
    font-size: 14px;
    color: var(--q-text-secondary);
  }
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-separator {
  display: flex;
  justify-content: center;
  margin: 12px 0;

  span {
    background-color: $color-background;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    color: var(--q-text-secondary);
    box-shadow: var(--shadow-1);
  }
}

.message-bubble {
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 8px;
  word-wrap: break-word;
  position: relative;
  box-shadow: var(--shadow-1);

  .message-content {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 14px;
    line-height: 1.5;
  }

  .message-time {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 4px;
    font-size: 11px;
    color: rgba(0, 0, 0, 0.45);

    .read-icon {
      color: currentColor;
      opacity: 0.7;
    }
  }
}

.message-sent {
  align-self: flex-end;
  background-color: var(--q-primary);
  color: white;

  .message-content {
    color: white;
  }

  .message-time {
    color: rgba(255, 255, 255, 0.7);
  }
}

.message-received {
  align-self: flex-start;
  background-color: $color-background;

  .message-content {
    color: var(--q-text-primary);
  }
}

// Dark mode overrides
.body--dark {
  .chat-area {
    background-color: #202124;
  }

  .date-separator span {
    background-color: $color-gray-800;
    color: $color-gray-400;
  }

  .message-received {
    background-color: $color-gray-800;

    .message-content {
      color: $color-text-dark;
    }

    .message-time {
      color: $color-gray-500;
    }
  }
}
</style>
