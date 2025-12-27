<script setup lang="ts">
import { computed } from 'vue'
import type { Rating } from '@/api/types/interaction'
import { RATING_VALUES } from '@/api/types/interaction'
import RatingStars from './RatingStars.vue'
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'

interface Props {
  reviewsStatistics: OrganizationReviewsStatistics
}

const props = defineProps<Props>()

const hasReviews = computed(() => {
  return props.reviewsStatistics.totalReviews > 0
})

const descendingRatings = computed(() => {
  return [...RATING_VALUES].reverse() as Rating[]
})
</script>

<template>
  <div class="stats-section">
    <div class="rating-distribution">
      <div v-for="rating in descendingRatings" :key="rating" class="distribution-bar">
        <span class="rating-label">{{ rating }}</span>
        <div class="bar-container">
          <div
            class="bar-fill"
            :style="{
              width: hasReviews
                ? `${((reviewsStatistics.ratingDistribution[rating] || 0) / reviewsStatistics.totalReviews) * 100}%`
                : '0%',
            }"
          />
        </div>
      </div>
    </div>

    <div class="rating-summary">
      <!-- <span class="rating-number">{{ reviewsStatistics.averageRating }}</span> -->
      <div class="rating-stars">
        <RatingStars :rating="reviewsStatistics.averageRating" :show-number="true" size="md" />
      </div>
      <span class="review-count">{{ reviewsStatistics.totalReviews }} recensioni</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rating-distribution {
  flex: 1;
  // max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  @media (max-width: $breakpoint-mobile) {
    width: 100%;
    order: 2;
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
    order: 1;
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

  // .rating-stars {
  //   display: flex;
  //   justify-content: center;
  // }

  .review-count {
    font-size: $font-size-lg;
    color: $color-text-secondary;
    font-weight: 400;

    @include dark-mode {
      color: $color-text-dark;
    }
  }
}
</style>
