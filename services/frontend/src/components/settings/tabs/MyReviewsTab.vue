<script setup lang="ts">
import { ref, onMounted, provide, watch } from 'vue'
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
const searchQuery = ref('')
const hasReviews = ref(false)
let searchTimeout: number | null = null

const loadReviews = async (isLoadingMore = false, isSearch = false) => {
  if (!authStore.isAuthenticated) return

  if (isLoadingMore) {
    loadingMore.value = true
  } else if (!isSearch) {
    loading.value = true
  }

  try {
    const response = await api.interactions.getUserReviews(authStore.user!.id, {
      search: searchQuery.value || undefined,
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

    if (response.items.length > 0 || response.totalItems > 0) {
      hasReviews.value = true
    }
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

watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    loadReviews(false, true)
  }, 500)
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
      <template v-if="hasReviews">
        <q-input
          v-model="searchQuery"
          outlined
          dense
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
