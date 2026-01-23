<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import type { Event as AppEvent } from '@/api/types/events'
import { useAuthStore } from '@/stores/auth'

const event = defineModel<AppEvent & { liked?: boolean }>({ required: true })

const emit = defineEmits<{
  authRequired: []
}>()

const { t } = useI18n()
const { locale, goToEventDetails, goToEditEvent } = useNavigation()
const authStore = useAuthStore()
const imageObjectUrl = ref<string>('')
const isLoadingImage = ref(true)

const isDraft = computed(() => event.value.status === 'DRAFT')

const loadImage = async (url: string) => {
  try {
    const response = await api.media.get(url)
    imageObjectUrl.value = URL.createObjectURL(response.file)
  } catch (error) {
    console.error('Failed to load image:', error)
  } finally {
    isLoadingImage.value = false
  }
}

onMounted(async () => {
  await loadImage(event.value.poster!)
})

onUnmounted(() => {
  if (imageObjectUrl.value && imageObjectUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageObjectUrl.value)
  }
})

// const formatDate = (date: Date) => {
//   return new Intl.DateTimeFormat(locale.value, {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   }).format(date)
// }

const day = computed(() => {
  return event.value?.date.getDate()
})

const month = computed(() => {
  return event.value?.date.toLocaleString(locale.value, { month: 'short' }).toUpperCase()
})

const toggleFavorite = async (e: MouseEvent) => {
  e.stopPropagation()

  if (!authStore.user?.id || !authStore.isAuthenticated) {
    emit('authRequired')
    return
  }

  if (!event.value) return

  try {
    if (event.value.liked) {
      await api.interactions.unlikeEvent(event.value.eventId, authStore.user.id)
    } else {
      await api.interactions.likeEvent(event.value.eventId, authStore.user.id)
    }
    event.value.liked = !event.value.liked
  } catch (error) {
    console.error('Failed to toggle like:', error)
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
        :alt="event.title ?? t('cards.eventCard.posterAlt')"
        class="event-image"
      />
      <div v-else class="image-loading">
        <q-spinner color="primary" size="40px" />
      </div>

      <button
        v-if="!isDraft"
        class="favorite-button"
        :class="{ 'is-favorite': event.liked }"
        :aria-label="t('cards.eventCard.favoriteButtonAriaLabel')"
        @click="toggleFavorite"
      >
        <q-icon :name="event.liked ? 'favorite' : 'favorite_border'" size="24px" />
      </button>

      <div v-if="!isDraft" class="date-badge">
        <div class="date-day">{{ day }}</div>
        <div class="date-month">{{ month }}</div>
      </div>

      <div v-if="isDraft" class="draft-badge">
        <q-icon name="edit_note" size="16px" />
        {{ t('event.draft') }}
      </div>
    </div>
    <div class="event-info">
      <h3 class="event-title">
        {{ event.title?.trim() ? event.title : t('cards.eventCard.draftMissingTitle') }}
      </h3>
      <div v-if="!isDraft" class="event-details">
        <!-- <span class="event-date">
          <q-icon name="event" size="16px" />
          {{ formatDate(new Date(event.date)) }}
        </span> -->
        <span class="event-location">
          <!-- <q-icon name="location_on" size="16px" /> -->
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
  @include flex-center;
  position: absolute;
  top: $spacing-3;
  left: $spacing-3;
  width: 44px;
  height: 44px;
  background: color-alpha($color-white, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all $transition-base;
  color: $color-gray-800;
  backdrop-filter: blur(10px);
  z-index: 1;

  &:hover {
    background: $color-white;
    transform: scale(1.1);
  }

  &.is-favorite {
    color: $color-primary;
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

.event-info {
  padding: $spacing-4;
}

.event-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  line-height: 1.3;
}

.event-details {
  @include flex-column;
  gap: $spacing-2;
  margin-top: $spacing-3;
}

.event-date,
.event-location {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  opacity: 0.7;
}
</style>
