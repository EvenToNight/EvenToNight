<script setup lang="ts">
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'
import RatingStars from '@/components/reviews/ratings/RatingStars.vue'

interface Props {
  reviewsStatistics: OrganizationReviewsStatistics
}

defineProps<Props>()
</script>
<template>
  <div class="rating-summary">
    <RatingStars
      :rating="reviewsStatistics.averageRating"
      size="md"
      :show-number="true"
      variant="compact"
    />
    <span class="review-count">({{ reviewsStatistics.totalReviews }} recensioni)</span>
  </div>
</template>
<style lang="scss" scoped>
.rating-summary {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
  }
}

.review-count {
  color: $color-text-secondary;
  font-size: $font-size-sm;

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
