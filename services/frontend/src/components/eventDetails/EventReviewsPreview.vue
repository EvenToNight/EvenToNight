<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from '@/components/cards/ReviewCard.vue'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import SeeAllButton from '@/components/buttons/basicButtons/SeeAllButton.vue'
import RatingInfo from '../reviews/ratings/RatingInfo.vue'
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'
import LoadableComponent from '@/components/common/LoadableComponent.vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  eventId: string
  organizationId: string
}

const props = defineProps<Props>()
const { goToEventReviews } = useNavigation()
const authStore = useAuthStore()

const reviews = ref<EventReview[]>([])
const loading = ref(true)
const reviewsStatistics = ref<OrganizationReviewsStatistics>()
const canUserLeaveReview = ref(false)

const loadReviews = async () => {
  try {
    loading.value = true
    reviews.value = (
      await api.interactions.getEventReviews(props.eventId, {
        pagination: { limit: 4 },
      })
    ).items
    reviewsStatistics.value = await api.interactions.getOrganizationReviews(props.organizationId)
    if (authStore.user) {
      const response = await api.interactions.userParticipatedToEvent(
        authStore.user.id,
        props.eventId
      )
      console.log('User participation response:', response)
      canUserLeaveReview.value = !(
        await api.interactions.userParticipatedToEvent(authStore.user.id, props.eventId)
      ).hasReviewed
    }
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

const goToAllReviews = () => {
  window.scrollTo({ top: 0, behavior: 'auto' })
  goToEventReviews(props.organizationId, props.eventId)
}

onMounted(() => {
  loadReviews()
})
</script>

<template>
  <LoadableComponent :loading="loading" label="Caricamento recensioni...">
    <div v-if="reviews.length > 0" class="reviews-preview">
      <div class="preview-header">
        <div class="header-top">
          <h3 class="section-title">Recensioni</h3>
          <SeeAllButton @click="goToAllReviews" />
        </div>
        <RatingInfo
          v-if="reviewsStatistics"
          :reviews-statistics="reviewsStatistics"
          class="rating-summary"
        />
      </div>

      <div class="reviews-list">
        <ReviewCard
          v-for="review in reviews"
          :key="review.eventId + '-' + review.userId"
          :review="review"
          :show-event-info="false"
        />
      </div>
    </div>
    <div
      v-if="canUserLeaveReview"
      class="event-info"
      @click="goToEventReviews(props.organizationId, props.eventId, true)"
    >
      <q-icon name="rate_review" class="event-icon" />
      <span class="event-title">Lascia una recensione</span>
    </div>
    <div v-else-if="reviews.length === 0" class="reviews-preview">
      <div class="empty-state">
        <q-icon name="rate_review" size="48px" />
        <span class="empty-text">Non ci sono ancora recensioni per questo evento</span>
      </div>
    </div>
  </LoadableComponent>
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
  @media (max-width: $breakpoint-mobile) {
    flex-direction: row;
  }
  @media (max-width: $app-min-width) {
    flex-direction: column;
    align-items: flex-start;
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
.event-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  color: $color-text-primary;
  margin: $spacing-6 auto;
  padding: $spacing-3 $spacing-5;
  cursor: pointer;
  transition: all $transition-base;
  border-radius: $radius-full;
  border: 2px solid $color-border;
  width: fit-content;

  &:hover {
    border-color: $color-text-muted;

    @include dark-mode {
      border-color: $color-white;
    }
  }

  @include dark-mode {
    color: $color-white;
    border-color: $color-text-muted;
  }

  .event-icon {
    font-size: 1rem;
    color: $color-text-primary;

    @include dark-mode {
      color: $color-white;
    }
  }
  .event-title {
    font-size: $font-size-base;
    font-weight: 600;
  }
}
</style>
