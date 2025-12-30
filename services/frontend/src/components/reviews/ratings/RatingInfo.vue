<script setup lang="ts">
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'
import RatingStars from '@/components/reviews/ratings/RatingStars.vue'
import { watch } from 'vue'

interface Props {
  reviewsStatistics: OrganizationReviewsStatistics
}
const props = defineProps<Props>()
watch(
  () => props.reviewsStatistics,
  (newVal) => {
    console.log('reviewsStatistics changed:', newVal)
  }
)
</script>
<template>
  <div class="rating-summary">
    <template v-if="!reviewsStatistics.totalReviews">
      <span class="review-count">Nessuna recensione</span>
    </template>
    <template v-else>
      <RatingStars
        :rating="reviewsStatistics.averageRating"
        size="md"
        :show-number="true"
        variant="compact"
      />
      <span class="review-count">({{ reviewsStatistics.totalReviews }} recensioni)</span>
    </template>
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
