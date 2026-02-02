<script setup lang="ts">
import { onMounted } from 'vue'
import type { EventReview, Rating } from '@/api/types/interaction'
import ReviewCard from '../cards/ReviewCard.vue'
import { api } from '@/api'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { defaultLimit } from '@/api/utils/requestUtils'
import { useTranslation } from '@/composables/useTranslation'

interface Props {
  organizationId: string
  eventId?: string
  selectedRating?: Rating
}
const props = defineProps<Props>()
const { t } = useTranslation('components.reviews.ReviewsList')
const {
  items: reviews,
  loading,
  loadingMore,
  onLoad,
  loadItems,
} = useInfiniteScroll<EventReview>({
  itemsPerPage: defaultLimit,
  loadFn: async (limit, offset) => {
    if (props.eventId) {
      return await api.interactions.getEventReviews(props.eventId, {
        pagination: { limit, offset },
        rating: props.selectedRating,
      })
    }
    return await api.interactions.getOrganizationReviews(props.organizationId, {
      pagination: { limit, offset },
      rating: props.selectedRating,
    })
  },
})

onMounted(() => {
  loadItems()
})

defineExpose({
  reload: () => loadItems(),
})
</script>

<template>
  <div class="reviews-list">
    <q-inner-loading :showing="loading && reviews.length === 0">
      <q-spinner color="primary" size="50px" />
    </q-inner-loading>

    <q-infinite-scroll
      v-if="!loading && reviews.length > 0"
      :offset="250"
      :disable="loadingMore"
      @load="onLoad"
    >
      <div class="reviews-container">
        <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>

    <div v-else-if="!loading && reviews.length === 0" class="empty-state">
      <q-icon name="reviews" size="64px" />
      <p>{{ t('noReviews') }}</p>
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
