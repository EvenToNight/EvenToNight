<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import type { Event } from '@/api/types/events'

interface Props {
  event: Event
}

const props = defineProps<Props>()

const { t } = useI18n()
const { locale, goToEventDetails, goToCreateEvent } = useNavigation()
const imageObjectUrl = ref<string>('')
const isLoadingImage = ref(true)

const isDraft = computed(() => props.event.status === 'draft')

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

onMounted(() => {
  loadImage(props.event.posterLink)
})

onUnmounted(() => {
  if (imageObjectUrl.value && imageObjectUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageObjectUrl.value)
  }
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <div class="event-card" @click="isDraft ? goToCreateEvent() : goToEventDetails(event.id)">
    <div class="card-image-container">
      <img v-if="imageObjectUrl" :src="imageObjectUrl" :alt="event.title" class="card-image" />
      <div v-else-if="isLoadingImage" class="card-image-loading">Loading...</div>

      <template v-if="isDraft">
        <div class="draft-badge">
          <q-icon name="edit_note" size="16px" />
          {{ t('profile.draft') }}
        </div>
        <div class="card-content-overlay">
          <h3 class="card-title">{{ event.title }}</h3>
        </div>
      </template>
      <!-- <div v-if="isDraft" class="draft-badge">
        <q-icon name="edit_note" size="16px" />
        {{ t('profile.draft') }}
      </div> -->

      <div v-else class="card-content-overlay">
        <h3 class="card-title">{{ event.title }}</h3>
        <p class="card-subtitle">{{ event.location.name || event.location.city }}</p>
        <div class="card-date">
          <q-icon name="event" size="16px" />
          {{ formatDate(event.date) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-card {
  width: 100%;
  max-width: 340px;
  border-radius: $radius-3xl;
  overflow: hidden;
  background: color-alpha($color-black, 0.02);
  transition: all 0.3s ease;
  cursor: pointer;

  @include dark-mode {
    background: color-alpha($color-white, 0.05);
  }
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: $shadow-lg;
}

.card-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  .event-card:hover & {
    transform: scale(1.05);
  }
}

.card-image-loading {
  @include flex-center;
  width: 100%;
  height: 100%;
  background: color-alpha($color-black, 0.1);
  color: $color-gray-600;
}

.draft-badge {
  position: absolute;
  top: $spacing-3;
  right: $spacing-3;
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-2;
  background: color-alpha($color-black, 0.8);
  backdrop-filter: blur(8px);
  color: $color-white;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
}

.card-content-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-6;
  background: $color-gray-200;

  @include dark-mode {
    background: $color-background-dark-soft;
  }
}

.card-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin: 0 0 $spacing-2 0;
  line-height: $line-height-snug;

  @include dark-mode {
    color: $color-white;
  }
}

.card-subtitle {
  font-size: $font-size-base;
  color: $color-text-secondary;
  line-height: $line-height-relaxed;
  margin: 0 0 $spacing-2 0;

  @include dark-mode {
    color: $color-gray-300;
  }
}

.card-date {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  font-weight: $font-weight-medium;

  @include dark-mode {
    color: $color-gray-400;
  }
}

@media (max-width: $breakpoint-mobile) {
  .card-content-overlay {
    padding: $spacing-4;
  }

  .card-title {
    font-size: $font-size-xl;
    margin: 0 0 $spacing-1 0;
  }

  .card-subtitle {
    font-size: $font-size-sm;
    margin: 0 0 $spacing-1 0;
  }

  .card-date {
    font-size: $font-size-xs;
  }
}
</style>
