<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from './ReviewCard.vue'
import { api } from '@/api'

interface Props {
  organizationId: string
  eventId?: string
  selectedRating?: number
}
const props = defineProps<Props>()

const ITEMS_PER_PAGE = 10

const reviews = ref<EventReview[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)

const loadReviews = async (isLoadingMore = false) => {
  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const response = await api.interactions.getOrganizationReviews(props.organizationId, {
      pagination: {
        limit: ITEMS_PER_PAGE,
        offset: reviews.value.length || 0,
      },
    })

    if (isLoadingMore) {
      reviews.value = [...reviews.value, ...response.items]
    } else {
      reviews.value = response.items
    }

    hasMore.value = response.hasMore
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

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

onMounted(() => {
  loadReviews()
})

defineExpose({
  reload: () => loadReviews(),
})
</script>

<template>
  <div class="reviews-list">
    <q-inner-loading :showing="loading && reviews.length === 0">
      <q-spinner-dots color="primary" size="50px" />
    </q-inner-loading>

    <q-infinite-scroll
      v-if="!loading && reviews.length > 0"
      :offset="250"
      :disable="loadingMore || !hasMore"
      @load="onLoad"
    >
      <div class="reviews-container">
        <ReviewCard
          v-for="review in reviews"
          :key="review.eventId + '-' + review.userId"
          :review="review"
        />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>

    <div v-else-if="!loading && reviews.length === 0" class="empty-state">
      <q-icon name="reviews" size="64px" />
      <p>No reviews found</p>
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
