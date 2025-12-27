<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { EventReview, OrganizationReviewsStatistics } from '@/api/types/interaction'
import ReviewsListView from '@/components/reviews/ReviewsListView.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import SubmitReviewDialog from '@/components/reviews/SubmitReviewDialog.vue'
import ReviewsStatistics from '@/components/reviews/ReviewsStatistics.vue'

const { params, goToUserProfile } = useNavigation()

const eventId = computed(() => params.id as string)
const reviews = ref<EventReview[]>([])
const loading = ref(true)
const eventTitle = ref<string>('')
const organizationId = ref<string>('')
const organizationName = ref<string>('')
const organizationAvatar = ref<string>('')

const showReviewDialog = ref(false)
const reviewsStatistics = ref<OrganizationReviewsStatistics>()
const loadReviews = async () => {
  loading.value = true
  try {
    reviews.value = (await api.interactions.getEventReviews(eventId.value)).items
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

const loadEventInfo = async () => {
  try {
    const event = await api.events.getEventById(eventId.value)
    eventTitle.value = event.title || 'Event'
    organizationId.value = event.id_creator
    reviewsStatistics.value = await api.interactions.getOrganizationReviews(organizationId.value)

    // Load organization info
    if (organizationId.value) {
      const response = await api.users.getUserById(organizationId.value)
      organizationName.value = response.user.name
      organizationAvatar.value = response.user.avatarUrl || ''
    }
  } catch (error) {
    console.error('Failed to load event:', error)
  }
}

const goToOrganizationProfile = () => {
  if (organizationId.value) {
    goToUserProfile(organizationId.value)
  }
}

// const openReviewDialog = () => {
//   newReviewRating.value = 5
//   newReviewTitle.value = ''
//   newReviewDescription.value = ''
//   showReviewDialog.value = true
// }

onMounted(async () => {
  await Promise.all([loadReviews(), loadEventInfo()])
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
        <ReviewsStatistics v-if="reviewsStatistics" :reviews-statistics="reviewsStatistics" />
        <ReviewsListView
          :reviews="reviews"
          :loading="loading"
          :show-add-review-button="true"
          @add-review="showReviewDialog = true"
        />
      </div>
    </div>
    <SubmitReviewDialog v-model:isOpen="showReviewDialog" :creator-id="organizationId" />
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
</style>
