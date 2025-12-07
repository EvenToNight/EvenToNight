<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'

interface Props {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  date: Date
  favorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  favorite: false,
})

const emit = defineEmits<{
  favoriteToggle: [value: boolean]
  authRequired: []
}>()

const authStore = useAuthStore()
const { locale, goToEventDetails } = useNavigation()
const isFavorite = ref(props.favorite)
const imageObjectUrl = ref<string>('')
const isLoadingImage = ref(true)

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
  loadImage(props.imageUrl)
})

onUnmounted(() => {
  if (imageObjectUrl.value && imageObjectUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageObjectUrl.value)
  }
})

const toggleFavorite = (event: Event) => {
  event.stopPropagation()
  if (!authStore.isAuthenticated) {
    emit('authRequired')
    return
  }
  isFavorite.value = !isFavorite.value
  emit('favoriteToggle', isFavorite.value)
}

const day = computed(() => {
  return props.date.getDate()
})

const month = computed(() => {
  return props.date.toLocaleString(locale.value, { month: 'short' }).toUpperCase()
})
</script>

<template>
  <div class="event-card" @click="goToEventDetails(id)">
    <div class="card-image-container">
      <img v-if="imageObjectUrl" :src="imageObjectUrl" :alt="title" class="card-image" />
      <div v-else-if="isLoadingImage" class="card-image-loading">Loading...</div>

      <button
        class="favorite-button"
        :class="{ 'is-favorite': isFavorite }"
        aria-label="Toggle favorite"
        @click="toggleFavorite"
      >
        <q-icon :name="isFavorite ? 'favorite' : 'favorite_border'" size="28px" />
      </button>

      <div class="date-badge">
        <div class="date-day">{{ day }}</div>
        <div class="date-month">{{ month }}</div>
      </div>
    </div>

    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-card {
  width: 100%;
  border-radius: $radius-3xl;
  overflow: hidden;
  background: $color-black;
  transition: transform $transition-base;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-4px);
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
}

.card-image-loading {
  @include flex-center;
  width: 100%;
  height: 100%;
  background: color-alpha($color-black, 0.1);
  color: $color-gray-600;
}

.favorite-button {
  @include flex-center;
  position: absolute;
  top: 16px;
  left: 16px;
  width: 48px;
  height: 48px;
  background: color-alpha($color-white, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all $transition-base;
  color: $color-gray-800;
  backdrop-filter: blur(10px);
}

.favorite-button:hover {
  background: $color-white;
  transform: scale(1.1);
}

.favorite-button.is-favorite {
  color: $color-primary;
}

.date-badge {
  position: absolute;
  top: 16px;
  right: 16px;
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

.card-content {
  padding: $spacing-6;
  background: $color-black;
}

.card-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-white;
  margin: 0 0 $spacing-2 0;
  line-height: $line-height-snug;
}

.card-subtitle {
  font-size: $font-size-base;
  color: $color-gray-300;
  line-height: $line-height-relaxed;
}

@media (max-width: $breakpoint-mobile) {
  .favorite-button {
    width: 40px;
    height: 40px;
    top: 12px;
    left: 12px;
  }

  .favorite-button :deep(.q-icon) {
    font-size: 20px;
  }

  .date-badge {
    top: 12px;
    right: 12px;
    padding: $spacing-2;
    min-width: 48px;
  }

  .date-day {
    font-size: $font-size-xl;
  }

  .date-month {
    font-size: $font-size-xs;
  }

  .card-content {
    padding: $spacing-5;
  }

  .card-title {
    font-size: $font-size-xl;
    margin: 0 0 $spacing-1 0;
  }

  .card-subtitle {
    font-size: $font-size-sm;
  }
}
</style>
