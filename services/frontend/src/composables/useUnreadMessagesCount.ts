import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { NewMessageReceivedEvent } from '@/api/types/notifications'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
export function useUnreadMessagesCount() {
  const authStore = useAuthStore()
  const unreadMessagesCount = ref<number | undefined>(undefined)

  const loadUnreadMessagesCount = async () => {
    if (authStore.user) {
      try {
        const response = await api.chat.unreadMessageCountFor(authStore.user.id)
        unreadMessagesCount.value = response.unreadCount
      } catch (error) {
        logger.error('Failed to load unread messages count:', error)
        unreadMessagesCount.value = 0
      }
    }
  }

  const handleNewMessage = (event: NewMessageReceivedEvent) => {
    const { senderId } = event
    if (senderId !== authStore.user?.id) {
      unreadMessagesCount.value = (unreadMessagesCount.value || 0) + 1
    }
  }

  watch(
    () => authStore.user,
    (user) => {
      if (user) {
        loadUnreadMessagesCount()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    api.notifications.onNewMessageReceived(handleNewMessage)
  })

  onUnmounted(() => {
    api.notifications.offNewMessageReceived(handleNewMessage)
  })

  return {
    unreadMessagesCount,
    loadUnreadMessagesCount,
  }
}
