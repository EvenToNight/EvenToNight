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
const { locale, goToEventDetails, goToEditEvent } = useNavigation()
const imageObjectUrl = ref<string>('')
const isLoadingImage = ref(true)

const isDraft = computed(() => props.event.status === 'DRAFT')

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
  loadImage(props.event.poster)
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
  <div
    class="event-card"
    @click="isDraft ? goToEditEvent(event.id_event) : goToEventDetails(event.id_event)"
  >
    <div class="event-image-container">
      <img :src="event.poster" :alt="event.title" class="event-image" />
      <div v-if="isDraft" class="draft-badge">
        <q-icon name="edit_note" size="16px" />
        {{ t('event.draft') }}
      </div>
    </div>
    <div class="event-info">
      <h3 class="event-title">{{ event.title }}</h3>
      <div v-if="!isDraft" class="event-details">
        <span class="event-date">
          <q-icon name="event" size="16px" />
          {{ formatDate(new Date(event.date)) }}
        </span>
        <span class="event-location">
          <q-icon name="location_on" size="16px" />
          {{ event.location.name || event.location.city }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-card {
  background: rgba(0, 0, 0, 0.02);
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
