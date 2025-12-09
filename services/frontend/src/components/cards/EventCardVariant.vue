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
    <div class="event-image-container">
      <img :src="event.posterLink" :alt="event.title" class="event-image" />
      <div v-if="isDraft" class="draft-badge">
        <q-icon name="edit_note" size="16px" />
        {{ t('profile.draft') }}
      </div>
    </div>
    <div class="event-info">
      <h3 class="event-title">{{ event.title }}</h3>
      <div v-if="!isDraft" class="event-details">
        <span class="event-date">
          <q-icon name="event" size="16px" />
          {{ formatDate(event.date) }}
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
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

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
  transition: transform 0.3s ease;

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
  color: white;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.event-info {
  padding: $spacing-4;
}

.event-title {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  margin-top: $spacing-3;
}

.event-date,
.event-location {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
