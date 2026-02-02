<script setup lang="ts">
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'
import RatingStars from '@/components/reviews/ratings/RatingStars.vue'
import { useTranslation } from '@/composables/useTranslation'

interface Props {
  reviewsStatistics: OrganizationReviewsStatistics
}
defineProps<Props>()
const { t } = useTranslation('components.reviews.ratings.RatingInfo')
</script>
<template>
  <div class="flex items-center q-gutter-x-md wrap">
    <template v-if="!reviewsStatistics.totalReviews">
      <span class="text-caption text-grey-7">{{ t('noReviews') }}</span>
    </template>
    <template v-else>
      <RatingStars
        :rating="reviewsStatistics.averageRating"
        size="md"
        :show-number="true"
        variant="compact"
      />
      <span class="text-caption text-grey-7"
        >({{ reviewsStatistics.totalReviews }} {{ t('reviews') }})</span
      >
    </template>
  </div>
</template>
