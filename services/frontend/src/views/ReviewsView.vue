<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { EventReview, OrganizationReviewsStatistics } from '@/api/types/interaction'
import ReviewsList from '@/components/reviews/ReviewsList.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import SubmitReviewDialog from '@/components/reviews/SubmitReviewDialog.vue'
import ReviewsStatistics from '@/components/reviews/ReviewsStatistics.vue'
import ReviewsFilters from '@/components/reviews/ReviewsFilters.vue'
import type { EventID } from '@/api/types/events'
import type { Rating } from '@/api/types/interaction'

const { query, params, goToUserProfile } = useNavigation()
const organizationId = computed(() => params.organizationId as string)
const tempEventId = ref<EventID | null>((query.eventId as EventID) || null)
const tempSelectedRating = ref<Rating | null>(null)
const allReviews = ref<EventReview[]>([])
const loading = ref(true)
const organizationName = ref<string>('')
const organizationAvatar = ref<string>('')

const showReviewDialog = ref(false)
const reviewsStatistics = ref<OrganizationReviewsStatistics>()

const reviews = computed(() => {
  let filtered = allReviews.value

  // Filter by event if selected
  if (tempEventId.value) {
    filtered = filtered.filter((review) => review.eventId === tempEventId.value)
  }

  // Filter by rating if selected
  if (tempSelectedRating.value) {
    filtered = filtered.filter((review) => review.rating === tempSelectedRating.value)
  }

  return filtered
})

const loadReviews = async () => {
  loading.value = true
  try {
    const response = await api.interactions.getOrganizationReviews(organizationId.value)
    allReviews.value = response.items
    reviewsStatistics.value = {
      averageRating: response.averageRating,
      totalReviews: response.totalReviews,
      ratingDistribution: response.ratingDistribution,
    }
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

const loadOrganizationInfo = async () => {
  try {
    const response = await api.users.getUserById(organizationId.value)
    organizationName.value = response.user.name
    organizationAvatar.value = response.user.avatarUrl || ''
  } catch (error) {
    console.error('Failed to load organization:', error)
  }
}

const goToOrganizationProfile = () => {
  if (organizationId.value) {
    goToUserProfile(organizationId.value)
  }
}

const handleDeleteReview = (eventId: string, userId: string) => {
  console.log('review deleted', eventId, userId)
  // allReviews.value = allReviews.value.filter((review) => review.id !== reviewId)
}

provide('deleteReview', handleDeleteReview)

onMounted(() => {
  loadReviews()
  loadOrganizationInfo()
})
</script>

<template>
  <div class="reviews-view">
    <NavigationButtons />
    <div class="page-content">
      <div class="container">
        <div class="header-section">
          <div class="title-row">
            <div v-if="organizationId" class="organization-info">
              <q-avatar size="40px" class="organization-avatar" @click="goToOrganizationProfile">
                <img v-if="organizationAvatar" :src="organizationAvatar" :alt="organizationName" />
                <q-icon v-else name="business" />
              </q-avatar>
              <span class="organization-name" @click="goToOrganizationProfile">{{
                organizationName
              }}</span>
            </div>
          </div>
        </div>
        <div class="reviews-header">
          <ReviewsStatistics v-if="reviewsStatistics" :reviews-statistics="reviewsStatistics" />
          <ReviewsFilters
            v-if="organizationId"
            v-model:selectedEventId="tempEventId"
            v-model:selectedRating="tempSelectedRating"
            :organizationId="organizationId"
          />
          <div class="add-review-section">
            <div class="event-info" @click="showReviewDialog = true">
              <q-icon name="rate_review" class="event-icon" />
              <span class="event-title">Lascia una recensione</span>
            </div>
          </div>
        </div>
        <ReviewsList
          :reviews="reviews"
          :loading="loading"
          @delete="() => console.log('review deleted')"
        />
      </div>
    </div>
    <SubmitReviewDialog
      v-if="organizationId"
      v-model:isOpen="showReviewDialog"
      :creator-id="organizationId"
    />
  </div>
</template>

<style lang="scss" scoped>
.reviews-view {
  @include flex-column;
  min-height: 100vh;
  background: $color-background;

  @include dark-mode {
    background: $color-background-dark;
  }
}
.reviews-header {
  background: $color-background;
  border-radius: $radius-xl;
  padding: $spacing-6;
  margin-bottom: $spacing-6;
  box-shadow: $shadow-md;

  @include dark-mode {
    background: $color-background-dark;
  }
}
.page-content {
  flex: 1;
  padding: $spacing-8 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-4;
}

.header-section {
  margin-bottom: $spacing-6;
}

.title-column {
  @include flex-column;
}

.organization-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.organization-avatar {
  background: $color-primary-light;
  cursor: pointer;
  transition: transform $transition-base;

  &:hover {
    transform: scale(1.05);
  }

  @include dark-mode {
    background: $color-primary-dark;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .q-icon {
    color: $color-primary;
  }
}

.organization-name {
  font-weight: 600;
  font-size: $font-size-base;
  color: $color-text-primary;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    text-decoration: underline;
  }

  @include dark-mode {
    color: $color-heading-dark;
  }
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

.add-review-section {
  display: flex;
  justify-content: center;
  padding-top: $spacing-4;
}

.add-review-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  background: $color-primary;
  color: white;
  border: none;
  border-radius: $radius-full;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;
  white-space: nowrap;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  .q-icon {
    font-size: 1.25rem;
  }
}

.event-info {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  color: $color-text-primary;
  margin-bottom: $spacing-3;
  padding: $spacing-2 $spacing-4;
  cursor: pointer;
  transition: all $transition-base;
  border-radius: $radius-full;
  border: 2px solid $color-border;

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
    font-size: $font-size-sm;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }

  &:hover {
    border-color: $color-text-muted;

    @include dark-mode {
      border-color: $color-white;
    }
  }
}
</style>
