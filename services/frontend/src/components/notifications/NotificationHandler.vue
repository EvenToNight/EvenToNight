<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useQuasar, type QNotifyCreateOptions } from 'quasar'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type {
  FollowRecievedEvent,
  LikeRecievedEvent,
  NewEventPublishedEvent,
  NewMessageReceivedEvent,
  NewReviewRecievedEvent,
} from '@/api/types/notifications'
import { useAuthStore } from '@/stores/auth'
import { useTranslation } from '@/composables/useTranslation'

const $q = useQuasar()
const { t } = useTranslation('components.notifications.NotificationHandler')
const activeNotifications = ref(0)
const MAX_NOTIFICATIONS = 3
const authStore = useAuthStore()
const { goToChat, goToUserProfile, goToEventDetails, goToEventReviews, routeName } = useNavigation()

const showNotification = (
  options: QNotifyCreateOptions,
  action: { label: string; handler: () => void }
) => {
  if (activeNotifications.value >= MAX_NOTIFICATIONS) return
  activeNotifications.value++
  const timeout = options.timeout || 5000
  setTimeout(() => {
    activeNotifications.value--
  }, timeout)
  $q.notify({
    ...options,
    position: 'top',
    timeout: 4000,
    color: $q.dark.isActive ? 'grey-8' : 'grey-2',
    group: false,
    actions: [
      {
        ...action,
        color: $q.dark.isActive ? 'grey-2' : 'grey-8',
      },
    ],
  })
}

const handleNewMessage = (event: NewMessageReceivedEvent) => {
  const { senderName, message, senderAvatar, senderId } = event
  if (authStore.user?.id === senderId) return
  if (routeName.value === 'chat') return
  showNotification(
    {
      message: senderName,
      caption: message.length > 50 ? message.substring(0, 50) + '...' : message,
      avatar: senderAvatar,
    },
    {
      label: t('newMessageLabel'),
      handler: () => {
        goToChat(senderId)
      },
    }
  )
}

const handleNewLike = (event: LikeRecievedEvent) => {
  const { eventName, userId, userName, userAvatar } = event
  showNotification(
    {
      message: userName,
      caption: `liked your event "${eventName}"`,
      avatar: userAvatar,
    },
    {
      label: t('newLikeLabel'),
      handler: () => {
        goToUserProfile(userId)
      },
    }
  )
}

const handleNewFollow = (event: FollowRecievedEvent) => {
  const { followerId, followerName, followerAvatar } = event
  showNotification(
    {
      message: followerName,
      caption: 'Started following you',
      avatar: followerAvatar,
    },
    {
      label: t('newFollowLabel'),
      handler: () => {
        goToUserProfile(followerId)
      },
    }
  )
}

const handleNewEvent = async (event: NewEventPublishedEvent) => {
  const { creatorId, eventId, eventName, creatorName } = event
  const user = await api.users.getUserById(creatorId)
  showNotification(
    {
      message: creatorName,
      caption: `${t('newEventCaption')}: "${eventName}"`,
      avatar: user.avatar,
    },
    {
      label: t('newEventLabel'),
      handler: () => {
        goToEventDetails(eventId)
      },
    }
  )
}

const handleNewReview = (event: NewReviewRecievedEvent) => {
  const { eventId, userName, userId, userAvatar } = event
  showNotification(
    {
      message: userName,
      caption: t('newReviewCaption'),
      avatar: userAvatar,
    },
    {
      label: t('newReviewLabel'),
      handler: () => {
        goToEventReviews(userId, eventId)
      },
    }
  )
}

onMounted(() => {
  api.notifications.onNewMessageReceived(handleNewMessage)
  api.notifications.onLikeReceived(handleNewLike)
  api.notifications.onFollowReceived(handleNewFollow)
  api.notifications.onNewEventPublished(handleNewEvent)
  api.notifications.onNewReviewReceived(handleNewReview)
})

onUnmounted(() => {
  api.notifications.offNewMessageReceived(handleNewMessage)
  api.notifications.offLikeReceived(handleNewLike)
  api.notifications.offFollowReceived(handleNewFollow)
  api.notifications.offNewEventPublished(handleNewEvent)
  api.notifications.offNewReviewReceived(handleNewReview)
})
</script>

<template>
  <div />
</template>
