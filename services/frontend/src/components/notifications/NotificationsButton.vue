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
import { useTranslation } from '@/composables/useTranslation'

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
const { t } = useTranslation('components.notifications.NotificationsButton')
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
        caption = t('newEventCaption') + ` "${data.eventName}"`
        onClick = () => {
          goToEventDetails(data.eventId)
        }
        break
      }
      case 'follow_received': {
        const data = apiNotification.data as FollowRecievedEvent
        image = data.followerAvatar
        title = data.followerName
        caption = t('followerReceivedCaption')
        onClick = () => {
          goToUserProfile(data.followerId)
        }
        break
      }
      case 'like_received': {
        const data = apiNotification.data as LikeRecievedEvent
        image = data.userAvatar
        title = data.userName
        caption = t('likeReceivedCaption') + ` "${data.eventName}"`
        onClick = () => {
          goToUserProfile(data.userId)
        }
        break
      }
      case 'new_review_received': {
        const data = apiNotification.data as NewReviewRecievedEvent
        image = data.userAvatar || 'info'
        title = data.userName
        caption = t('reviewReceivedCaption')
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

const {
  items: notifications,
  onLoad,
  loadItems,
} = useInfiniteScroll<Notification>({
  itemsPerPage: defaultLimit,
  loadFn: loadNotifications,
})

const isMenuOpen = ref(false)

const incrementUnreadCountCallback = () => {
  if (!isMenuOpen.value) unreadNotificationsCount.value++
}

const handleMenuOpen = () => {
  isMenuOpen.value = true
  loadItems()
}

onMounted(async () => {
  //TODO: check if return string or number
  // await loadItems()
  const initialCount = await api.notifications.getUnreadNotificationsCount()
  unreadNotificationsCount.value = Number(initialCount) || 0
  api.notifications.onLikeReceived(incrementUnreadCountCallback)
  api.notifications.onFollowReceived(incrementUnreadCountCallback)
  api.notifications.onNewEventPublished(incrementUnreadCountCallback)
  api.notifications.onNewReviewReceived(incrementUnreadCountCallback)
})

onUnmounted(() => {
  api.notifications.offLikeReceived(incrementUnreadCountCallback)
  api.notifications.offFollowReceived(incrementUnreadCountCallback)
  api.notifications.offNewEventPublished(incrementUnreadCountCallback)
  api.notifications.offNewReviewReceived(incrementUnreadCountCallback)
})
</script>

<template>
  <q-btn :flat="true" :dense="dense" :round="!dense" icon="notifications" :aria-label="t('title')">
    <q-badge v-if="unreadNotificationsCount > 0" color="red" floating>{{
      String(unreadNotificationsCount)
    }}</q-badge>
    <q-menu
      class="notifications-menu"
      @before-show="handleMenuOpen"
      @before-hide="isMenuOpen = false"
    >
      <q-list style="min-width: 300px; max-width: 400px" class="notifications-list">
        <q-item-label header>{{ t('title') }}</q-item-label>
        <q-separator />
        <q-scroll-area
          class="notifications-scroll-area"
          :thumb-style="{ width: '4px', borderRadius: '2px', opacity: '0.5' }"
        >
          <q-infinite-scroll v-if="notifications.length > 0" :offset="50" @load="onLoad">
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
                <q-spinner color="primary" size="40px" />
              </div>
            </template>
          </q-infinite-scroll>
          <div v-else class="row justify-center items-center q-pa-md no-notifications">
            <p>{{ t('noNotifications') }}</p>
          </div>
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

  :deep(.q-avatar img) {
    object-fit: cover;
  }
}

.notifications-scroll-area {
  height: 400px;
}

.no-notifications {
  height: 400px;
}
</style>
