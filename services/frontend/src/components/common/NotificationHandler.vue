<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useQuasar, type QNotifyCreateOptions } from 'quasar'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { NewMessageReceivedEvent } from '@/api/types/notifications'
import { useAuthStore } from '@/stores/auth'

const $q = useQuasar()
const activeNotifications = ref(0)
const MAX_NOTIFICATIONS = 3
const authStore = useAuthStore()
const { goToChat, routeName } = useNavigation()

const showNotification = (options: QNotifyCreateOptions) => {
  if (activeNotifications.value >= MAX_NOTIFICATIONS) return
  activeNotifications.value++
  const timeout = options.timeout || 5000
  setTimeout(() => {
    activeNotifications.value--
  }, timeout)
  $q.notify(options)
}

const handleNewMessage = (event: NewMessageReceivedEvent) => {
  const { senderName, message, senderAvatar, senderId } = event
  if (authStore.user?.id === senderId) return
  if (routeName.value === 'chat') return
  showNotification({
    message: senderName,
    caption: message.length > 50 ? message.substring(0, 50) + '...' : message,
    avatar: senderAvatar,
    position: 'top',
    timeout: 4000,
    group: false,
    actions: [
      {
        label: 'Reply',
        color: 'white',
        handler: () => {
          goToChat(senderId)
        },
      },
    ],
  })
}

onMounted(() => {
  api.notifications.onNewMessageReceived(handleNewMessage)
})

onUnmounted(() => {
  api.notifications.offNewMessageReceived(handleNewMessage)
})
</script>
