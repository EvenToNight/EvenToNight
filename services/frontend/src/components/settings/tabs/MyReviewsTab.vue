<script setup lang="ts">
import { ref, onMounted, provide, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from '@/components/cards/ReviewCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'
import { defaultLimit, emptyPaginatedResponse } from '@/api/utils/requestUtils'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const $q = useQuasar()
const searchQuery = ref('')
const hasReviews = ref(false)

const {
  items: reviews,
  loadingMore,
  onLoad,
  loadItems,
} = useInfiniteScroll<EventReview>({
  itemsPerPage: defaultLimit,
  loadFn: async (limit, offset) => {
    try {
      return await api.interactions.getUserReviews(authStore.user!.id, {
        search: searchQuery.value || undefined,
        pagination: {
          limit,
          offset,
        },
      })
    } catch (error) {
      console.error('Failed to load user reviews:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to load your reviews.',
      })
      return emptyPaginatedResponse<EventReview>()
    }
  },
})

onMounted(async () => {
  await loadItems()
  hasReviews.value = reviews.value.length > 0
})

watch(searchQuery, () => {
  loadItems()
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
    <template v-if="hasReviews">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        debounce="300"
        placeholder="Search reviews..."
        class="search-input"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template v-if="searchQuery" #append>
          <q-icon name="close" class="cursor-pointer" @click="searchQuery = ''" />
        </template>
      </q-input>

      <q-infinite-scroll
        v-if="reviews.length > 0"
        :offset="250"
        :disable="loadingMore"
        @load="onLoad"
      >
        <div class="reviews-list">
          <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
        </div>

        <template #loading>
          <div class="loading-state">
            <q-spinner color="primary" size="50px" />
          </div>
        </template>
      </q-infinite-scroll>

      <EmptyState
        v-else
        empty-icon-name="search_off"
        empty-text="No reviews found matching your search."
        class="empty-state"
      />
    </template>

    <EmptyState
      v-else
      empty-icon-name="rate_review"
      empty-text="You have not submitted any reviews yet."
      class="empty-state"
    />
  </div>
</template>

<style lang="scss" scoped>
.my-reviews-tab {
  padding: $spacing-6;
  height: 100%;
  position: relative;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.search-input {
  margin-bottom: $spacing-4;
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
