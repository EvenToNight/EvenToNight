<template>
  <div class="event-card" @click="navigateToEvent">
    <div class="card-image-container">
      <img :src="imageUrl" :alt="title" class="card-image" />

      <!-- Heart/Favorite Icon -->
      <button
        class="favorite-button"
        :class="{ 'is-favorite': isFavorite }"
        aria-label="Toggle favorite"
        @click="toggleFavorite"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
      </button>

      <!-- Date Badge -->
      <div class="date-badge">
        <div class="date-day">{{ day }}</div>
        <div class="date-month">{{ month }}</div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  id: number | string
  imageUrl: string
  title: string
  subtitle: string
  date: Date | string
  favorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  favorite: false,
})

const emit = defineEmits<{
  favoriteToggle: [value: boolean]
}>()

const router = useRouter()
const isFavorite = ref(props.favorite)

const toggleFavorite = (event: Event) => {
  event.stopPropagation()
  isFavorite.value = !isFavorite.value
  emit('favoriteToggle', isFavorite.value)
}

const navigateToEvent = () => {
  router.push({ name: 'event-details', params: { id: props.id } })
}

const day = computed(() => {
  const dateObj = typeof props.date === 'string' ? new Date(props.date) : props.date
  return dateObj.getDate()
})

const month = computed(() => {
  const dateObj = typeof props.date === 'string' ? new Date(props.date) : props.date
  return dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase()
})
</script>

<style scoped>
.event-card {
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: #000;
  transition: transform 0.3s ease;
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

.favorite-button {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
  backdrop-filter: blur(10px);
}

.favorite-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.favorite-button.is-favorite {
  color: var(--q-primary);
}

.favorite-button.is-favorite svg {
  fill: currentColor;
}

.date-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  backdrop-filter: blur(10px);
  min-width: 56px;
}

.date-day {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  font-weight: 600;
  color: #000;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.card-content {
  padding: 20px 24px 24px;
  background: #000;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .favorite-button {
    width: 40px;
    height: 40px;
    top: 12px;
    left: 12px;
  }

  .favorite-button svg {
    width: 20px;
    height: 20px;
  }

  .date-badge {
    top: 12px;
    right: 12px;
    padding: 6px 10px;
    min-width: 48px;
  }

  .date-day {
    font-size: 20px;
  }

  .date-month {
    font-size: 11px;
  }

  .card-content {
    padding: 16px 20px 20px;
  }

  .card-title {
    font-size: 20px;
    margin: 0 0 6px 0;
  }

  .card-subtitle {
    font-size: 14px;
  }
}
</style>
