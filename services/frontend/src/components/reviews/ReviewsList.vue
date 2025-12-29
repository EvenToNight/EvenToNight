<script setup lang="ts">
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from './ReviewCard.vue'

interface Props {
  reviews: EventReview[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})
</script>

<template>
  <div class="reviews-list">
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="50px" />
      <p>Loading reviews...</p>
    </div>

    <div v-else-if="reviews.length === 0" class="empty-state">
      <q-icon name="reviews" size="64px" />
      <p>No reviews found</p>
    </div>

    <div v-else class="reviews-container">
      <ReviewCard
        v-for="review in reviews"
        :key="review.eventId + '-' + review.userId"
        :review="review"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reviews-list {
  width: 100%;
  // max-width: 900px;
  //margin: 0 auto;
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
