<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import RatingStars from '@/components/reviews/RatingStars.vue'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import SeeAllButton from '@/components/buttons/basicButtons/SeeAllButton.vue'

interface Props {
  eventId: string
  organizationId: string
}

const props = defineProps<Props>()
const { goToEventReviews } = useNavigation()

const reviews = ref<EventReview[]>([])
const loading = ref(true)

const previewReviews = computed(() => reviews.value.slice(0, 3))

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.value.length
})

const loadReviews = async () => {
  try {
    loading.value = true
    reviews.value = (await api.interactions.getEventReviews(props.eventId)).items
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

const goToAllReviews = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  goToEventReviews(props.organizationId, props.eventId)
}

onMounted(() => {
  loadReviews()
})
</script>

<template>
  <div v-if="loading" class="reviews-preview">
    <div class="loading-state">
      <q-spinner color="primary" size="40px" />
      <span class="loading-text">Caricamento recensioni...</span>
    </div>
  </div>

  <div v-else-if="reviews.length > 0" class="reviews-preview">
    <div class="preview-header">
      <div class="header-top">
        <h3 class="section-title">Recensioni</h3>
        <SeeAllButton @click="goToAllReviews" />
      </div>
      <div class="rating-summary">
        <RatingStars :rating="averageRating" size="md" :show-number="true" variant="compact" />
        <span class="review-count">({{ reviews.length }} recensioni)</span>
      </div>
    </div>

    <div class="reviews-list">
      <ReviewCard
        v-for="review in previewReviews"
        :key="review.id"
        :review="review"
        :show-event-info="false"
      />
    </div>
  </div>

  <div v-else class="reviews-preview">
    <div class="empty-state">
      <q-icon name="rate_review" size="48px" />
      <span class="empty-text">Non ci sono ancora recensioni per questo evento</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reviews-preview {
  margin-top: $spacing-8;
  padding-top: $spacing-8;
  border-top: 1px solid $color-border;

  @include dark-mode {
    border-top-color: $color-border-dark;
  }
}

.preview-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  margin-bottom: $spacing-3;
}

.header-top {
  @include flex-between;
  gap: $spacing-6;
}

.section-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0;

  @include dark-mode {
    color: $color-heading-dark;
  }
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: $spacing-3;

  @media (max-width: $app-min-width) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.review-count {
  color: $color-text-secondary;
  font-size: $font-size-sm;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-3;
  padding: $spacing-8;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.loading-text {
  font-size: $font-size-base;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-3;
  padding: $spacing-8;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }

  .q-icon {
    opacity: 0.5;
  }
}

.empty-text {
  font-size: $font-size-base;
  font-weight: 500;
  text-align: center;
}

.view-more-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-4;
  margin-top: $spacing-6;
  background: $color-background;
  color: $color-primary;
  border: 2px solid $color-border;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    background: $color-primary-light;
    border-color: $color-primary;
    transform: translateY(-2px);
  }

  @include dark-mode {
    background: $color-background-dark;
    border-color: $color-border-dark;

    &:hover {
      background: rgba($color-primary, 0.2);
      border-color: $color-primary;
    }
  }

  .q-icon {
    font-size: 1.25rem;
  }
}
</style>
