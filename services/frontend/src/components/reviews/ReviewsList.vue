<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from './ReviewCard.vue'
import RatingStars from './RatingStars.vue'

interface Props {
  reviews: EventReview[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const selectedRating = ref<number | null>(null)

const ratingOptions = [
  { label: 'All', value: null },
  { label: '5 Stars', value: 5 },
  { label: '4 Stars', value: 4 },
  { label: '3 Stars', value: 3 },
  { label: '2 Stars', value: 2 },
  { label: '1 Star', value: 1 },
]

const filteredReviews = computed(() => {
  if (selectedRating.value === null) {
    return props.reviews
  }
  return props.reviews.filter((review) => review.rating === selectedRating.value)
})

const averageRating = computed(() => {
  if (props.reviews.length === 0) return '0.0'
  const sum = props.reviews.reduce((acc, review) => acc + review.rating, 0)
  return (sum / props.reviews.length).toFixed(1)
})

const numericRating = computed(() => {
  return Number(averageRating.value)
})

const ratingDistribution = computed(() => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  props.reviews.forEach((review) => {
    if (review.rating > 0) {
      distribution[review.rating as keyof typeof distribution]++
    }
  })
  return distribution
})
</script>

<template>
  <div class="reviews-list">
    <div class="reviews-header">
      <div class="stats-section">
        <div class="rating-distribution">
          <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="distribution-bar">
            <span class="rating-label">{{ rating }}</span>
            <div class="bar-container">
              <div
                class="bar-fill"
                :style="{
                  width:
                    reviews.length > 0
                      ? `${(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100}%`
                      : '0%',
                }"
              />
            </div>
          </div>
        </div>

        <div class="rating-summary">
          <span class="rating-number">{{ averageRating }}</span>
          <div class="rating-stars">
            <RatingStars :rating="numericRating" :show-number="false" size="md" />
          </div>
          <span class="review-count">{{ reviews.length.toLocaleString() }} recensioni</span>
        </div>
      </div>

      <div class="filter-section">
        <label class="filter-label">Filter by rating:</label>
        <div class="filter-buttons">
          <button
            v-for="option in ratingOptions"
            :key="option.label"
            :class="['filter-btn', { active: selectedRating === option.value }]"
            @click="selectedRating = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="50px" />
      <p>Loading reviews...</p>
    </div>

    <div v-else-if="filteredReviews.length === 0" class="empty-state">
      <q-icon name="reviews" size="64px" />
      <p>No reviews found</p>
    </div>

    <div v-else class="reviews-container">
      <ReviewCard v-for="review in filteredReviews" :key="review.id" :review="review" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reviews-list {
  width: 100%;
  // max-width: 900px;
  //margin: 0 auto;
}

.reviews-header {
  background: $color-background;
  border-radius: $radius-xl;
  padding: $spacing-6;
  margin-bottom: $spacing-6;
  box-shadow: $shadow-md;

  @include dark-mode {
    background: $color-background-dark;
  }
}

.stats-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-8;
  margin-bottom: $spacing-6;
  padding: $spacing-6 0;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
  }
}

.rating-distribution {
  flex: 1;
  // max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  @media (max-width: $breakpoint-mobile) {
    width: 100%;
  }
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: $spacing-3;

  .rating-label {
    width: 12px;
    font-size: $font-size-base;
    font-weight: 400;
    color: $color-text-primary;
    text-align: left;

    @include dark-mode {
      color: $color-heading-dark;
    }
  }

  .bar-container {
    flex: 1;
    height: 12px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: $radius-full;
    overflow: hidden;

    @include dark-mode {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    transition: width $transition-base;
    border-radius: $radius-full;
  }
}

.rating-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  min-width: 200px;
  flex-shrink: 0;

  @media (max-width: $breakpoint-mobile) {
    min-width: auto;
    width: 100%;
  }

  .rating-number {
    font-size: 5rem;
    font-weight: 300;
    color: $color-text-primary;
    line-height: 1;

    @include dark-mode {
      color: $color-heading-dark;
    }
  }

  .rating-stars {
    display: flex;
    justify-content: center;
  }

  .review-count {
    font-size: $font-size-lg;
    color: $color-text-secondary;
    font-weight: 400;

    @include dark-mode {
      color: $color-text-dark;
    }
  }
}

.filter-section {
  padding-top: $spacing-4;
  border-top: 1px solid $color-border;

  @include dark-mode {
    border-top-color: $color-border-dark;
  }
}

.filter-label {
  display: block;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $spacing-3;

  @include dark-mode {
    color: $color-heading-dark;
  }
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.filter-btn {
  padding: $spacing-2 $spacing-4;
  border: 2px solid $color-border;
  border-radius: $radius-full;
  background: transparent;
  color: $color-text-secondary;
  font-size: $font-size-sm;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;

  @include dark-mode {
    border-color: $color-border-dark;
    color: $color-text-dark;
  }

  &:hover {
    border-color: $color-primary;
    color: $color-primary;
  }

  &.active {
    border-color: $color-primary;
    background: $color-primary;
    color: white;
  }
}

.reviews-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.loading-state,
.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-8;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }

  .q-icon {
    margin-bottom: $spacing-4;
    color: $color-text-muted;

    @include dark-mode {
      color: $color-text-dark;
    }
  }
}
</style>
