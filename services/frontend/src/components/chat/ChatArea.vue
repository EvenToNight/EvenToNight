<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { ConversationID, Message, ChatUser } from '@/api/types/chat'
import type { QScrollArea } from 'quasar'
import ChatHeader from './ChatHeader.vue'
import MessageInput from './MessageInput.vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { NewMessageReceivedEvent } from '@/api/types/notifications'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { emptyPaginatedResponse } from '@/api/utils/requestUtils'
import { useNavigation } from '@/router/utils'
import { useTranslation } from '@/composables/useTranslation'

const props = defineProps<{
  selectedChatUser?: ChatUser
}>()

const selectedConversationId = defineModel<ConversationID | undefined>('selectedConversationId', {
  default: undefined,
})

const emit = defineEmits<{
  back: []
  read: []
}>()

const scrollAreaRef = ref<QScrollArea | null>(null)
const autoScroll = ref(true)
const unreadScrollCount = ref(0)

const authStore = useAuthStore()
const { isMobile } = useBreakpoints()
const { locale } = useNavigation()
const { t } = useTranslation('components.chat.ChatArea')

const {
  items: messages,
  loading,
  loadItems,
  onLoad,
  reload,
} = useInfiniteScroll<Message>({
  itemsPerPage: 50,
  prepend: true,
  loadFn: async (limit, offset) => {
    if (!selectedConversationId.value) {
      return emptyPaginatedResponse<Message>()
    }
    return api.chat.getConversationMessages(authStore.user!.id, selectedConversationId.value, {
      limit,
      offset,
    })
  },
})
function isFromCurrentUser(message: Message): boolean {
  return message.senderId === authStore.user?.id
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
}

function formatDateSeparator(date: Date): string {
  const now = new Date()
  const messageDate = new Date(date)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

  if (msgDate.getTime() === today.getTime()) {
    return t('today')
  } else if (msgDate.getTime() === yesterday.getTime()) {
    return t('yesterday')
  } else {
    return messageDate.toLocaleDateString(locale.value, {
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

function scrollToBottom(smooth = false) {
  emit('read')
  nextTick(() => {
    const scrollTarget = scrollAreaRef.value?.getScrollTarget()
    if (scrollTarget) {
      scrollAreaRef.value?.setScrollPosition(
        'vertical',
        scrollTarget.scrollHeight,
        smooth ? 200 : 0
      )
      unreadScrollCount.value = 0
    }
  })
}

function onScroll(info: { verticalPercentage: number }) {
  const scrollTarget = scrollAreaRef.value?.getScrollTarget()
  if (scrollTarget) {
    const hasScroll = scrollTarget.scrollHeight > scrollTarget.clientHeight
    const atBottom = !hasScroll || info.verticalPercentage >= 0.98
    if (!autoScroll.value && atBottom) {
      unreadScrollCount.value = 0
      emit('read')
    }
    autoScroll.value = atBottom
  }
}

const pendingScroll = ref(false)

async function handleSendMessage(content: string) {
  if (!content.trim()) return

  pendingScroll.value = true

  if (!selectedConversationId.value) {
    const response = await api.chat.startConversation(authStore.user!.id, {
      recipientId: props.selectedChatUser!.id,
      content: content.trim(),
    })

    selectedConversationId.value = response.conversationId
  } else {
    await api.chat.sendMessage(authStore.user!.id, selectedConversationId.value, content.trim())
  }
}

const newMessageHandler = (event: NewMessageReceivedEvent) => {
  const { conversationId, senderId, messageId, message, createdAt } = event

  if (selectedConversationId.value !== conversationId) return
  if (messages.value.some((m) => m.id === messageId)) return

  messages.value.push({
    id: messageId,
    conversationId: conversationId,
    senderId: senderId,
    content: message,
    createdAt: new Date(createdAt),
    isRead: false,
  })

  if (pendingScroll.value) {
    pendingScroll.value = false
    scrollToBottom()
    api.chat.readConversationMessages(conversationId, authStore.user!.id)
  } else if (autoScroll.value) {
    api.chat.readConversationMessages(conversationId, authStore.user!.id)
  } else {
    unreadScrollCount.value += 1
  }
}

onMounted(async () => {
  await loadItems()
  api.notifications.onNewMessageReceived(newMessageHandler)
})

onUnmounted(() => {
  api.notifications.offNewMessageReceived(newMessageHandler)
})

watch(selectedConversationId, (newId, oldId) => {
  if (newId !== oldId) {
    unreadScrollCount.value = 0
    if (newId) {
      messages.value = []
      reload()
    } else {
      messages.value = []
    }
  }
})
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
      <h3>{{ t('selectConversation') }}</h3>
      <p>{{ t('selectConversationHint') }}</p>
    </div>

    <template v-else>
      <ChatHeader
        :selected-chat-user="selectedChatUser"
        :show-back-button="isMobile"
        @back="emit('back')"
      />

      <q-scroll-area ref="scrollAreaRef" class="messages-container" @scroll="onScroll">
        <div v-if="loading" class="loading-messages">
          <q-spinner color="primary" size="40px" />
        </div>

        <div v-else-if="messages.length === 0" class="empty-messages">
          <q-icon name="chat" size="80px" color="grey-4" />
          <p>{{ t('emptyConversation') }}</p>
          <span>{{ t('emptyConversationHint') }}</span>
        </div>

        <q-infinite-scroll v-else reverse :offset="200" @load="onLoad">
          <template #loading>
            <div class="loading-more">
              <q-spinner color="primary" size="24px" />
            </div>
          </template>

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
        </q-infinite-scroll>
      </q-scroll-area>

      <q-btn
        v-if="!autoScroll"
        fab
        icon="keyboard_arrow_down"
        class="scroll-to-bottom-btn"
        @click="scrollToBottom(true)"
      >
        <q-badge v-if="unreadScrollCount > 0" color="primary" text-color="white" floating>
          {{ unreadScrollCount }}
        </q-badge>
      </q-btn>

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
  position: relative;
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
  padding: 20px;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.scroll-to-bottom-btn {
  position: absolute;
  bottom: 72px;
  right: 16px;
  z-index: 100;
  background-color: $color-background !important;
  box-shadow: var(--shadow-2) !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
  margin-bottom: 8px;
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

  .scroll-to-bottom-btn {
    background-color: $color-gray-800 !important;
    color: $color-text-dark !important;
  }
}
</style>
