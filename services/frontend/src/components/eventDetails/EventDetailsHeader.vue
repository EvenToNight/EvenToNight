<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { Event } from '@/api/types/events'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import UserList from '@/components/user/UserList.vue'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

interface Props {
  event: Event
}

const emit = defineEmits<{
  authRequired: [void]
}>()

const props = defineProps<Props>()
const authStore = useAuthStore()
const { goToEditEvent } = useNavigation()
const { t } = useTranslation('components.eventDetails.EventDetailsHeader')
const logger = createLogger(import.meta.url)
const isOrganizer = computed(() => {
  return authStore.user?.id === props.event.creatorId
})

const isFavorite = ref(false)
const likesCount = ref(0)
const showLikesDialog = ref(false)
const participantsCount = ref(0)
const showParticipantsDialog = ref(false)

const loadInteractions = async () => {
  try {
    const likes = await api.interactions.getEventLikes(props.event.eventId)
    likesCount.value = likes.totalItems

    const participants = await api.interactions.getEventParticipants(props.event.eventId)
    participantsCount.value = participants.totalItems

    if (authStore.isAuthenticated) {
      isFavorite.value = await api.interactions.userLikesEvent(
        props.event.eventId,
        authStore.user!.id
      )
    }
  } catch (error) {
    logger.error('Failed to load interactions:', error)
    likesCount.value = 0
    isFavorite.value = false
    participantsCount.value = 0
  }
}

const toggleLike = async () => {
  if (!authStore.isAuthenticated) {
    emit('authRequired')
    return
  }
  const wasLiked = isFavorite.value

  // Optimistic update
  isFavorite.value = !isFavorite.value
  likesCount.value += isFavorite.value ? 1 : -1

  try {
    if (!wasLiked) {
      await api.interactions.likeEvent(props.event.eventId, authStore.user!.id)
    } else {
      await api.interactions.unlikeEvent(props.event.eventId, authStore.user!.id)
    }
  } catch (error) {
    logger.error('Failed to toggle like:', error)
    isFavorite.value = wasLiked
    likesCount.value += wasLiked ? 1 : -1
  }
}

onMounted(async () => {
  await loadInteractions()
})
</script>
<template>
  <div class="title-row">
    <div class="title-content">
      <h1 class="event-title">{{ props.event.title }}</h1>
      <p class="event-subtitle">{{ props.event.location.name || props.event.location.city }}</p>
    </div>
    <div class="action-buttons">
      <q-btn
        v-if="isOrganizer"
        flat
        :label="t('editEvent')"
        icon="edit"
        class="base-button base-button--secondary"
        @click="goToEditEvent(props.event.eventId)"
      />
      <div class="like-container">
        <button class="like-button" :class="{ liked: isFavorite }" @click="toggleLike">
          <q-icon :name="isFavorite ? 'favorite' : 'favorite_border'" size="24px" />
        </button>
        <span
          class="like-count"
          role="button"
          tabindex="0"
          @click="showLikesDialog = true"
          @keydown.enter="showLikesDialog = true"
          >{{ likesCount }}</span
        >
      </div>
      <div class="participants-container">
        <q-icon name="people" size="24px" class="participants-icon" />
        <span
          class="participants-count"
          role="button"
          tabindex="0"
          @click="showParticipantsDialog = true"
          @keydown.enter="showParticipantsDialog = true"
          >{{ participantsCount }}</span
        >
      </div>
    </div>
  </div>

  <div v-if="props.event.tags && props.event.tags.length" class="tags-container">
    <span v-for="tag in props.event.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
  </div>

  <UserList
    v-model="showLikesDialog"
    :load-fn="(pagination) => api.interactions.getEventLikes(props.event.eventId, pagination)"
    :title="t('likes')"
    :empty-text="t('noLikes')"
    empty-icon="favorite_border"
  />
  <UserList
    v-model="showParticipantsDialog"
    :load-fn="
      (pagination) => api.interactions.getEventParticipants(props.event.eventId, pagination)
    "
    :title="t('participants')"
    :empty-text="t('noParticipants')"
    empty-icon="people"
  />
</template>

<style scoped lang="scss">
.title-row {
  @include flex-between;
  align-items: flex-start;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    gap: $spacing-3;
  }
}

.title-content {
  flex: 1;
  min-width: 0;
}

.action-buttons {
  display: flex;
  gap: $spacing-2;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: $breakpoint-mobile) {
    width: 100%;
    justify-content: space-between;
  }
}

.event-title {
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  line-height: 1.2;
  margin-bottom: $spacing-2;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-3xl;
  }
}

.event-subtitle {
  font-size: $font-size-xl;
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.like-container {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-3;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  flex-shrink: 0;

  @include dark-mode {
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.like-button {
  @include flex-center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all $transition-base;
  color: $color-text-primary;
  padding: 0;

  &:hover {
    transform: scale(1.1);
  }

  &.liked {
    color: $color-primary;

    .q-icon {
      color: $color-primary;
    }
  }

  @include dark-mode {
    color: $color-text-dark;
  }
}

.like-count {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-base;
  color: $color-text-primary;

  &:hover {
    opacity: 0.8;
  }

  @include dark-mode {
    color: $color-text-dark;
  }
}

.participants-container {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-3;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  flex-shrink: 0;

  @include dark-mode {
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.participants-icon {
  color: $color-text-primary;
  @include dark-mode {
    color: $color-text-dark;
  }
}

.participants-count {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-base;
  color: $color-text-primary;

  &:hover {
    opacity: 0.8;
  }

  @include dark-mode {
    color: $color-text-dark;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-bottom: $spacing-6;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: $spacing-2;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  background: $color-primary;
  cursor: default;
  color: $color-text-white;
}
</style>
