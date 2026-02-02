<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import {
  RATING_VALUES,
  type EventReview,
  type OrganizationReviewsStatistics,
} from '@/api/types/interaction'
import ReviewsList from '@/components/reviews/ReviewsList.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import SubmitReviewDialog from '@/components/reviews/SubmitReviewDialog.vue'
import ReviewsStatistics from '@/components/reviews/ReviewsStatistics.vue'
import ReviewsFilters from '@/components/reviews/ReviewsFilters.vue'
import type { EventID } from '@/api/types/events'
import type { Rating } from '@/api/types/interaction'
import { useAuthStore } from '@/stores/auth'

const { query, params, goToUserProfile, goToSettings } = useNavigation()
const authStore = useAuthStore()
const organizationId = computed(() => params.organizationId as string)
const tempEventId = ref<EventID | null>((query.eventId as EventID) || null)
const tempEventIdForDialog = ref<EventID | null>(null)
const canUserLeaveReview = ref(false)
const userHasReviews = ref(true)

const tempReview = ref<EventReview | null>(null)
const getRatingFromQuery = (): Rating | null => {
  if (typeof query.rating !== 'string') return null
  const num = Number(query.rating)
  if (RATING_VALUES.includes(num as Rating)) return num as Rating
  return null
}
const tempSelectedRating = ref<Rating | null>(getRatingFromQuery())
const organizationName = ref<string>('')
const organizationAvatar = ref<string>('')

// TODO: show leave a review button if: user is Logged in (bait if user is not logged? mh sus) and is NOT own profile
// AND user has participated in at least one event of the organization
const showReviewDialog = ref(false)
const reviewsStatistics = ref<OrganizationReviewsStatistics>()

const loadReviewsStatistics = async () => {
  const response = await api.interactions.getOrganizationReviews(organizationId.value, {
    pagination: {
      offset: 0,
      limit: 1,
    },
  })

  reviewsStatistics.value = {
    averageRating: response.averageRating,
    totalReviews: response.totalReviews,
    ratingDistribution: response.ratingDistribution,
  }
}
const loadOrganizationInfo = async () => {
  try {
    const user = await api.users.getUserById(organizationId.value)
    organizationName.value = user.name
    organizationAvatar.value = user.avatar || ''
  } catch (error) {
    console.error('Failed to load organization:', error)
  }
}

const loadCurrentUserReviewInfo = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const userId = authStore.user!.id
    const reviewsResponse = await api.interactions.getUserReviews(userId, {
      pagination: {
        limit: 1,
      },
    })
    const canReviewResponse = await api.interactions.userParticipations(userId, {
      organizationId: organizationId.value,
      reviewed: false,
      pagination: {
        limit: 1,
      },
    })
    if (query.eventId as EventID) {
      const tempEventIdForDialogResponse = await api.interactions.userParticipatedToEvent(
        userId,
        query.eventId as EventID
      )
      if (tempEventIdForDialogResponse) {
        const canAddReview =
          tempEventIdForDialogResponse.hasParticipated && !tempEventIdForDialogResponse.hasReviewed
        tempEventIdForDialog.value = canAddReview ? (query.eventId as EventID) : null
      }
    }

    if (query.eventId as EventID) {
      const existingReview = reviewsResponse.items.find(
        (review) => review.eventId === (query.eventId as EventID)
      )
      if (existingReview) {
        tempReview.value = existingReview
      }
    }
    if (reviewsResponse.totalItems > 0) {
      userHasReviews.value = true
    }
    if (canReviewResponse.totalItems > 0) {
      canUserLeaveReview.value = true
    }
  } catch (error) {
    console.error('Failed to load current user review info:', error)
  }
}
const reviewsListRef = ref<{ reload: () => void } | null>(null)

const handleUpdateReview = async (eventId: string, userId: string) => {
  console.log('review deleted', eventId, userId)
  reviewsListRef.value?.reload()
  await loadCurrentUserReviewInfo()
  console.log('reviews reloaded')
}

provide('deleteReview', handleUpdateReview)
provide('updateReview', handleUpdateReview)

onMounted(() => {
  loadOrganizationInfo()
  loadCurrentUserReviewInfo()
  loadReviewsStatistics()
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
              <q-avatar
                size="40px"
                class="organization-avatar"
                @click="goToUserProfile(organizationId)"
              >
                <img v-if="organizationAvatar" :src="organizationAvatar" :alt="organizationName" />
                <q-icon v-else name="business" />
              </q-avatar>
              <span class="organization-name" @click="goToUserProfile(organizationId)">{{
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
          <div v-if="canUserLeaveReview || userHasReviews" class="add-review-section">
            <div v-if="canUserLeaveReview" class="event-info" @click="showReviewDialog = true">
              <q-icon name="rate_review" class="event-icon" />
              <span class="event-title">Lascia una recensione</span>
            </div>
            <span v-if="canUserLeaveReview && userHasReviews" class="separator">oppure</span>
            <span
              v-if="userHasReviews"
              class="modify-link"
              @click="goToSettings(false, '#reviews')"
            >
              modifica le tue recensioni
            </span>
          </div>
        </div>
        <ReviewsList
          ref="reviewsListRef"
          :organization-id="organizationId"
          :event-id="tempEventId || undefined"
          :selected-rating="tempSelectedRating || undefined"
        />
      </div>
    </div>
    <SubmitReviewDialog
      v-if="organizationId"
      v-model:isOpen="showReviewDialog"
      :creator-id="organizationId"
      :selected-event-id="tempEventIdForDialog ?? undefined"
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: $spacing-4;
}

.separator {
  color: $color-text-secondary;
  font-size: $font-size-sm;
  font-weight: 500;
  margin: $spacing-2 0;
  @include dark-mode {
    color: $color-text-dark;
  }
}

.modify-link {
  color: $color-text-primary;
  font-size: $font-size-sm;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;

  @include dark-mode {
    color: $color-white;
  }

  &:hover {
    text-decoration: underline;
  }
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
  // margin-bottom: $spacing-3;
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
