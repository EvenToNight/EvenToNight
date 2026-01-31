<script setup lang="ts">
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'
import RatingStars from '@/components/reviews/ratings/RatingStars.vue'

interface Props {
  reviewsStatistics: OrganizationReviewsStatistics
}
defineProps<Props>()
</script>
<template>
  <div class="flex items-center q-gutter-x-md wrap">
    <template v-if="!reviewsStatistics.totalReviews">
      <span class="text-caption text-grey-7">Nessuna recensione</span>
    </template>
    <template v-else>
      <RatingStars
        :rating="reviewsStatistics.averageRating"
        size="md"
        :show-number="true"
        variant="compact"
      />
      <span class="text-caption text-grey-7"
        >({{ reviewsStatistics.totalReviews }} recensioni)</span
      >
    </template>
  </div>
</template>
