<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'

const ITEMS_PER_PAGE = 10

const authStore = useAuthStore()
const reviews = ref<EventReview[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)

const loadReviews = async (isLoadingMore = false) => {
  if (!authStore.user?.id) return

  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const response = await api.interactions.getUserReviews(authStore.user.id, {
      pagination: {
        limit: ITEMS_PER_PAGE,
        offset: isLoadingMore ? reviews.value.length : 0,
      },
    })

    if (isLoadingMore) {
      reviews.value = [...reviews.value, ...response.items]
    } else {
      reviews.value = response.items
    }

    hasMore.value = response.hasMore
  } catch (error) {
    console.error('Failed to load user reviews:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

onMounted(() => {
  loadReviews()
})

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!hasMore.value) {
    done(true)
    return
  }

  try {
    await loadReviews(true)
  } finally {
    done(!hasMore.value)
  }
}

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
      <q-infinite-scroll
        v-if="reviews.length > 0"
        :offset="250"
        :disable="loadingMore"
        @load="onLoad"
      >
        <div class="reviews-list">
          <ReviewCard
            v-for="review in reviews"
            :key="`${review.eventId}-${review.userId}`"
            :review="review"
          />
        </div>

        <template #loading>
          <div class="loading-state">
            <q-spinner-dots color="primary" size="50px" />
          </div>
        </template>
      </q-infinite-scroll>

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

.loading-state {
  @include flex-center;
  padding: $spacing-8;
}

.empty-state {
  padding: $spacing-8 0;
}
</style>
