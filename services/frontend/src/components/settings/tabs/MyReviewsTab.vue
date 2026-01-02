<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'

const authStore = useAuthStore()
const reviews = ref<EventReview[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!authStore.user?.id) return

  try {
    const response = await api.interactions.getUserReviews(authStore.user.id)
    reviews.value = response.items
  } catch (error) {
    console.error('Failed to load user reviews:', error)
  } finally {
    loading.value = false
  }
})

const deleteReview = (eventId: string, userId: string) => {
  reviews.value = reviews.value.filter(
    (r: EventReview) => !(r.eventId === eventId && r.userId === userId)
  )
}

provide('deleteReview', deleteReview)
</script>

<template>
  <div class="my-reviews-tab">
    <q-inner-loading :showing="loading" />

    <template v-if="!loading">
      <div v-if="reviews.length > 0" class="reviews-list">
        <ReviewCard
          v-for="review in reviews"
          :key="`${review.eventId}-${review.userId}`"
          :review="review"
        />
      </div>

      <EmptyState
        v-else
        empty-icon-name="rate_review"
        :empty-text="'You have not submitted any reviews yet.'"
        class="empty-state"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.my-reviews-tab {
  padding: $spacing-6;
  min-height: 400px;
  position: relative;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.empty-state {
  padding: $spacing-8 0;
}
</style>
