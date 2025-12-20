<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { EventReview } from '@/api/types/interaction'
import ReviewsList from '@/components/reviews/ReviewsList.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'

const { params, goToEventDetails } = useNavigation()

const eventId = computed(() => params.id as string)
const reviews = ref<EventReview[]>([])
const loading = ref(true)
const eventTitle = ref<string>('')

const loadReviews = async () => {
  loading.value = true
  try {
    reviews.value = await api.interactions.getEventReviews(eventId.value)
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

const loadEventInfo = async () => {
  try {
    const event = await api.events.getEventById(eventId.value)
    eventTitle.value = event.title || 'Event'
  } catch (error) {
    console.error('Failed to load event:', error)
  }
}

onMounted(async () => {
  await Promise.all([loadReviews(), loadEventInfo()])
})
</script>

<template>
  <div class="reviews-view">
    <NavigationButtons />

    <div class="page-content">
      <div class="container">
        <div class="header-section">
          <button class="back-button" @click="goToEventDetails(eventId)">
            <q-icon name="arrow_back" />
            Back to Event
          </button>
          <h1 class="page-title">Reviews for {{ eventTitle }}</h1>
        </div>

        <ReviewsList :reviews="reviews" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reviews-view {
  @include flex-column;
  min-height: 100vh;
  background: $color-background;

  @include dark-mode {
    background: $color-background-dark;
  }
}

.page-content {
  flex: 1;
  padding: $spacing-8 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-4;
}

.header-section {
  margin-bottom: $spacing-6;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  margin-bottom: $spacing-4;
  background: transparent;
  border: none;
  color: $color-primary;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    color: $color-primary-dark;
    transform: translateX(-4px);
  }

  .q-icon {
    font-size: 1.25rem;
  }
}

.page-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0;

  @include dark-mode {
    color: $color-heading-dark;
  }
}
</style>
