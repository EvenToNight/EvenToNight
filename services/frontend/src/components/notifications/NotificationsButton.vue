<script setup lang="ts">
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { PaginatedResponse } from '@/api/interfaces/commons'
import { api } from '@/api'
import type {
  NewEventPublishedEvent,
  FollowRecievedEvent,
  LikeRecievedEvent,
  NewReviewRecievedEvent,
} from '@/api/types/notifications'
import { useNavigation } from '@/router/utils'
import { defaultLimit } from '@/api/utils/requestUtils'
import { onMounted, onUnmounted, ref } from 'vue'

interface Notification {
  id: string
  image: string
  title: string
  caption: string
  timestamp: string
  onClick?: () => void
}

interface Props {
  dense?: boolean
}

defineProps<Props>()
const { goToEventDetails, goToUserProfile, goToEventReviews } = useNavigation()

const unreadNotificationsCount = ref(0)

const loadNotifications = async (
  limit: number,
  offset: number
): Promise<PaginatedResponse<Notification>> => {
  const response = await api.notifications.getNotifications({ limit, offset })
  await api.notifications.readAllNotifications()
  unreadNotificationsCount.value = 0
  const notificationsPromises = response.items.map(async (apiNotification) => {
    let image: string
    let title: string
    let caption: string
    let onClick: () => void

    switch (apiNotification.type) {
      case 'new_event_published': {
        const data = apiNotification.data as NewEventPublishedEvent
        const user = await api.users.getUserById(data.creatorId)
        image = user.avatar
        title = data.creatorName
        caption = `Published a new event "${data.eventName}"`
        onClick = () => {
          goToEventDetails(data.eventId)
        }
        break
      }
      case 'follow_received': {
        const data = apiNotification.data as FollowRecievedEvent
        image = data.followerAvatar
        title = data.followerName
        caption = 'Started following you'
        onClick = () => {
          goToUserProfile(data.followerId)
        }
        break
      }
      case 'like_received': {
        const data = apiNotification.data as LikeRecievedEvent
        image = data.userAvatar
        title = data.userName
        caption = `Liked your event "${data.eventName}"`
        onClick = () => {
          goToUserProfile(data.userId)
        }
        break
      }
      case 'new_review_received': {
        const data = apiNotification.data as NewReviewRecievedEvent
        image = data.userAvatar || 'info'
        title = data.userName
        caption = 'Left a review on your event'
        onClick = () => {
          goToEventReviews(data.userId, data.eventId)
        }
        break
      }
      default:
        return null
    }

    return {
      id: apiNotification.id,
      image,
      title,
      caption,
      timestamp: apiNotification.timestamp.toISOString(),
      onClick,
    }
  })

  const notificationsWithNulls = await Promise.all(notificationsPromises)
  const notifications = notificationsWithNulls.filter((n) => n !== null) as Notification[]

  return {
    ...response,
    items: notifications,
  }
}

const { items: notifications, onLoad } = useInfiniteScroll<Notification>({
  itemsPerPage: defaultLimit,
  loadFn: loadNotifications,
})

const incrementUnreadCountCallback = () => {
  unreadNotificationsCount.value++
}

onMounted(async () => {
  //TODO: check if return string or number
  const initialCount = await api.notifications.getUnreadNotificationsCount()
  unreadNotificationsCount.value = Number(initialCount) || 0
  api.notifications.onLikeReceived(incrementUnreadCountCallback)
  api.notifications.onFollowReceived(incrementUnreadCountCallback)
  api.notifications.onNewEventPublished(incrementUnreadCountCallback)
  api.notifications.onNewReviewRecieved(incrementUnreadCountCallback)
})

onUnmounted(() => {
  api.notifications.offLikeReceived(incrementUnreadCountCallback)
  api.notifications.offFollowReceived(incrementUnreadCountCallback)
  api.notifications.offNewEventPublished(incrementUnreadCountCallback)
  api.notifications.offNewReviewRecieved(incrementUnreadCountCallback)
})
</script>

<template>
  <q-btn :flat="true" :dense="dense" :round="!dense" icon="notifications">
    <q-badge v-if="unreadNotificationsCount > 0" color="red" floating>{{
      String(unreadNotificationsCount)
    }}</q-badge>
    <q-tooltip>Notifications</q-tooltip>
    <q-menu class="notifications-menu">
      <q-list style="min-width: 300px; max-width: 400px" class="notifications-list">
        <q-item-label header>Notifications</q-item-label>
        <q-separator />
        <q-scroll-area
          class="notifications-scroll-area"
          :thumb-style="{ width: '4px', borderRadius: '2px', opacity: '0.5' }"
        >
          <q-infinite-scroll :offset="50" @load="onLoad">
            <template v-for="(notification, index) in notifications" :key="notification.id">
              <q-item clickable @click="notification.onClick?.()">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="notification.image" alt="Avatar" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ notification.title }}</q-item-label>
                  <q-item-label caption>{{ notification.caption }}</q-item-label>
                  <q-item-label caption class="text-grey">{{
                    notification.timestamp
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator v-if="index < notifications.length - 1" />
            </template>
            <template #loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </template>
          </q-infinite-scroll>
        </q-scroll-area>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style scoped lang="scss">
.notifications-list {
  :deep(.q-item) {
    @include dark-mode {
      background: $color-background-dark;
      &:hover {
        background: color-alpha($color-background-dark, 0.5);
      }
    }
  }
}

.notifications-scroll-area {
  height: 400px;
  max-height: 60vh;
}
</style>
