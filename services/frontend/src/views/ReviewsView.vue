<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import { RATING_VALUES, type OrganizationReviewsStatistics } from '@/api/types/interaction'
import ReviewsList from '@/components/reviews/ReviewsList.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import SubmitReviewDialog from '@/components/reviews/SubmitReviewDialog.vue'
import ReviewsStatistics from '@/components/reviews/ReviewsStatistics.vue'
import ReviewsFilters from '@/components/reviews/ReviewsFilters.vue'
import type { EventID } from '@/api/types/events'
import type { Rating } from '@/api/types/interaction'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/api/types/users'
import { NOT_FOUND_ROUTE_NAME } from '@/router'

const { query, params, goToUserProfile, goToSettings, goToRoute } = useNavigation()
const authStore = useAuthStore()
const organization = ref<User>()
const reviewsStatistics = ref<OrganizationReviewsStatistics>()

//TODO: when to put as query param?
const getRatingFromQuery = (): Rating | null => {
  if (typeof query.rating !== 'string') return null
  const num = Number(query.rating)
  if (RATING_VALUES.includes(num as Rating)) return num as Rating
  return null
}

const selectedEventIdFilter = ref<EventID | null>((query.eventId as EventID) || null)
const selectedRatingFilter = ref<Rating | null>(getRatingFromQuery())

const canUserLeaveReview = ref(false)
const userHasReviews = ref(false)
// const tempEventIdForDialog = ref<EventID | null>(null)
// const tempReview = ref<EventReview | null>(null)

// TODO: show leave a review button if: user is Logged in (bait if user is not logged? mh sus) and is NOT own profile
// AND user has participated in at least one event of the organization
const showReviewDialog = ref(false)

const loadReviewsStatistics = async () => {
  reviewsStatistics.value = await api.interactions.getOrganizationReviewStatistics(
    organization.value!.id
  )
}

const loadOrganizationInfo = async () => {
  try {
    organization.value = await api.users.getUserById(params.organizationId as string)
  } catch (error) {
    console.error('Failed to load organization:', error)
    goToRoute(NOT_FOUND_ROUTE_NAME)
  }
}

const loadCurrentUserReviewInfo = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const userId = authStore.user!.id
    const userHasLeavedReview = await api.interactions.getUserReviews(userId, {
      pagination: {
        limit: 1,
      },
    })
    const userHasUnreviewedParticipations = await api.interactions.userParticipations(userId, {
      organizationId: organization.value!.id,
      reviewed: false,
      pagination: {
        limit: 1,
      },
    })

    //TODO: check from dialog
    // if (query.eventId as EventID) {
    //   const tempEventIdForDialogResponse = await api.interactions.userParticipatedToEvent(
    //     userId,
    //     query.eventId as EventID
    //   )
    //   if (tempEventIdForDialogResponse) {
    //     const canAddReview =
    //       tempEventIdForDialogResponse.hasParticipated && !tempEventIdForDialogResponse.hasReviewed
    //     tempEventIdForDialog.value = canAddReview ? (query.eventId as EventID) : null
    //   }
    // }

    if (userHasLeavedReview.totalItems > 0) {
      userHasReviews.value = true
    }
    if (userHasUnreviewedParticipations.totalItems > 0) {
      canUserLeaveReview.value = true
    }
  } catch (error) {
    console.error('Failed to load current user review info:', error)
  }
}
const reviewsListRef = ref<{ reload: () => void } | null>(null)

const handleUpdateReview = async (eventId: string, userId: string) => {
  console.log('review modified or deleted', eventId, userId)
  reviewsListRef.value?.reload()
  await loadCurrentUserReviewInfo()
  console.log('reviews reloaded')
}

provide('deleteReview', handleUpdateReview)
provide('updateReview', handleUpdateReview)

onMounted(async () => {
  await loadOrganizationInfo()
  await loadCurrentUserReviewInfo()
  await loadReviewsStatistics()

  // Apri automaticamente il dialog se il parametro query è presente
  if (query.openDialog === 'true' && canUserLeaveReview.value) {
    showReviewDialog.value = true
  }
})
</script>

<template>
  <div class="reviews-view">
    <NavigationButtons />
    <div class="page-content">
      <div v-if="organization" class="container">
        <div class="header-section">
          <div class="title-row">
            <div class="organization-info">
              <q-avatar
                size="40px"
                class="organization-avatar"
                @click="goToUserProfile(organization.id)"
              >
                <img :src="organization.avatar" :alt="organization.name + ' avatar'" />
              </q-avatar>
              <span class="organization-name" @click="goToUserProfile(organization.id)">{{
                organization.name
              }}</span>
            </div>
          </div>
        </div>
        <div class="reviews-header">
          <ReviewsStatistics v-if="reviewsStatistics" :reviews-statistics="reviewsStatistics" />
          <ReviewsFilters
            v-model:selectedEventId="selectedEventIdFilter"
            v-model:selectedRating="selectedRatingFilter"
            :organizationId="organization.id"
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
        <!-- TODO: evaluate putting a watcher inside the component instead of using the key trick -->
        <ReviewsList
          :key="selectedEventIdFilter + '-' + selectedRatingFilter"
          ref="reviewsListRef"
          :organization-id="organization.id"
          :event-id="selectedEventIdFilter || undefined"
          :selected-rating="selectedRatingFilter || undefined"
        />
      </div>
    </div>
    <SubmitReviewDialog
      v-if="organization"
      v-model:isOpen="showReviewDialog"
      :creator-id="organization.id"
      :selected-event-id="selectedEventIdFilter ?? undefined"
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
