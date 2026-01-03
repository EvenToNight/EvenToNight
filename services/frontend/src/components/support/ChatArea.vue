<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import type { Conversation, Message } from '@/api/types/support'
import ChatHeader from './ChatHeader.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  conversation?: Conversation
  messages?: Message[]
}>()

const emit = defineEmits<{
  back: []
  loadMore: []
}>()

const messagesContainer = ref<HTMLElement | null>(null)
const autoScroll = ref(true)

const authStore = useAuthStore()

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
import { useQuasar } from 'quasar'

const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
const $q = useQuasar()

const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)

function shouldShowDateSeparator(index: number): boolean {
  if (!props.messages || index === 0) return true
  const currentMsg = props.messages[index]
  const prevMsg = props.messages[index - 1]
  if (!currentMsg || !prevMsg) return false

  const currentDate = new Date(currentMsg.timestamp)
  const prevDate = new Date(prevMsg.timestamp)

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

  // Check if at bottom for auto-scroll
  const tolerance = 48 // px from bottom to consider "at bottom"
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - tolerance
  autoScroll.value = atBottom

  // Check if near top to load more messages
  const nearTop = el.scrollTop < 200 // px from top to trigger load more
  if (nearTop) {
    emit('loadMore')
  }
}

onMounted(() => {
  // attach scroll listener
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', onContainerScroll, { passive: true })
  }
  // ensure initial scroll to bottom
  scrollToBottom()
})

onBeforeUnmount(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', onContainerScroll)
  }
})

// Watch the conversation messages (deep) and autoscroll only if the user is at/near bottom
watch(
  () => props.messages,
  () => {
    if (autoScroll.value) {
      scrollToBottom()
    }
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div class="chat-area">
    <div v-if="!conversation" class="empty-state">
      <q-icon name="chat_bubble_outline" size="120px" color="grey-5" />
      <h3>Seleziona una conversazione</h3>
      <p>Scegli una chat dalla lista o inizia una nuova conversazione</p>
    </div>

    <template v-else>
      <ChatHeader :conversation="conversation" :show-back-button="isMobile" @back="emit('back')" />

      <div ref="messagesContainer" class="messages-container">
        <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
          <div v-if="shouldShowDateSeparator(index)" class="date-separator">
            <span>{{ formatDateSeparator(message.timestamp) }}</span>
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
              {{ formatTime(message.timestamp) }}
              <q-icon
                v-if="isFromCurrentUser(message)"
                name="done_all"
                size="16px"
                class="read-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/variables' as *;

.chat-area {
  display: flex;
  flex-direction: column;
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

.desktop-header {
  @media (max-width: 768px) {
    display: none;
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
