<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'
import { useImageLoader } from '@/composables/useImageLoader'
import { useTranslation } from '@/composables/useTranslation'
import type { EventLoadResult } from '@/api/utils/eventUtils'
import { createLogger } from '@/utils/logger'
import { SERVER_ERROR_ROUTE_NAME } from '@/router'

const event = defineModel<EventLoadResult>({ required: true })
const isDraft = computed(() => event.value.status === 'DRAFT')
const isCancelled = computed(() => event.value.status === 'CANCELLED')
const logger = createLogger(import.meta.url)

const emit = defineEmits<{
  authRequired: []
}>()

const { t } = useTranslation('components.cards.EventCard')
const { locale, goToEventDetails, goToEditEvent, goToRoute } = useNavigation()
const authStore = useAuthStore()

const { imageObjectUrl, isLoadingImage, loadImage } = useImageLoader()

onMounted(() => {
  loadImage(event.value.poster!)
})

const day = computed(() => {
  return event.value?.date.getDate()
})

const month = computed(() => {
  return event.value?.date.toLocaleString(locale.value, { month: 'short' }).toUpperCase()
})

const toggleFavorite = async (e: Event) => {
  e.stopPropagation()

  if (!authStore.isAuthenticated) {
    emit('authRequired')
    return
  }

  if (!event.value) return

  try {
    if (event.value.liked) {
      await api.interactions.unlikeEvent(event.value.eventId, authStore.user!.id)
    } else {
      await api.interactions.likeEvent(event.value.eventId, authStore.user!.id)
    }
    event.value.liked = !event.value.liked
  } catch (error) {
    logger.error('Failed to toggle like:', error)
    goToRoute(SERVER_ERROR_ROUTE_NAME)
  }
}
</script>

<template>
  <div
    class="event-card"
    @click="isDraft ? goToEditEvent(event.eventId) : goToEventDetails(event.eventId)"
  >
    <div class="event-image-container">
      <img
        v-if="!isLoadingImage && imageObjectUrl"
        :src="imageObjectUrl"
        :alt="event.title ?? t('posterAlt')"
        class="event-image"
      />
      <div v-else class="image-loading">
        <q-spinner color="primary" size="40px" />
      </div>

      <q-btn
        v-if="!isDraft"
        flat
        round
        :icon="event.liked ? 'favorite' : 'favorite_border'"
        size="md"
        class="favorite-button"
        :class="{ 'is-favorite': event.liked }"
        :aria-label="t('favoriteButtonAriaLabel')"
        @click="toggleFavorite"
      />

      <div v-if="!isDraft" class="date-badge">
        <div class="date-day">{{ day }}</div>
        <div class="date-month">{{ month }}</div>
      </div>

      <div v-if="isDraft" class="draft-badge">
        <q-icon name="edit_note" size="16px" />
        {{ t('draftBadge') }}
      </div>

      <div v-if="isCancelled" class="cancelled-banner row items-center justify-center">
        <q-icon name="cancel" size="18px" class="q-mr-xs" />
        <span class="text-body2 text-weight-bold text-uppercase">{{ t('cancelledBadge') }}</span>
      </div>
    </div>
    <div class="event-info q-pa-md">
      <h3 class="text-h6 text-weight-bold event-title q-ma-none">
        {{ event.title?.trim() ? event.title : t('draftMissingTitle') }}
      </h3>
      <div v-if="!isDraft" class="column q-mt-sm event-details">
        <span class="row items-center text-body2 event-location">
          {{ event.location.name || event.location.city }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-card {
  background: $color-white;
  border-radius: $radius-xl;
  overflow: hidden;
  cursor: pointer;
  transition: all $transition-slow;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
}

.event-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform $transition-slow;

  .event-card:hover & {
    transform: scale(1.05);
  }
}

.image-loading {
  @include flex-center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }
}

.favorite-button {
  position: absolute;
  top: $spacing-3;
  left: $spacing-3;
  background: color-alpha($color-white, 0.9) !important;
  transition: all $transition-base;
  color: $color-gray-800 !important;
  backdrop-filter: blur(10px);
  z-index: 1;

  &:hover {
    background: $color-white !important;
    transform: scale(1.1);
  }

  &.is-favorite {
    color: $color-primary !important;
  }
}

.date-badge {
  position: absolute;
  top: $spacing-3;
  right: $spacing-3;
  background: color-alpha($color-white, 0.95);
  border-radius: $radius-xl;
  padding: $spacing-2;
  text-align: center;
  backdrop-filter: blur(10px);
  min-width: 56px;
}

.date-day {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-black;
  line-height: $line-height-none;
}

.date-month {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $color-black;
  letter-spacing: 0.5px;
  margin-top: $spacing-1;
}

.draft-badge {
  position: absolute;
  top: $spacing-3;
  right: $spacing-3;
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-2;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  color: $color-white;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
}

.cancelled-banner {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: $spacing-2 $spacing-3;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  color: $color-white;
  letter-spacing: 0.5px;
  z-index: 2;
}

.event-title {
  line-height: 1.3;
}

.event-location {
  opacity: 0.7;
}
</style>
