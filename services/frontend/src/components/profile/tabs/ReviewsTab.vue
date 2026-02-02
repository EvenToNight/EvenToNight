<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import ReviewCard from '@/components/cards/ReviewCard.vue'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import SeeAllButton from '@/components/buttons/basicButtons/SeeAllButton.vue'
import { createLogger } from '@/utils/logger'
import { useTranslation } from '@/composables/useTranslation'
// import { useIsOwnProfile } from '@/composables/useProfile'

interface Props {
  organizationId: string
}

const props = defineProps<Props>()
const { goToEventReviews } = useNavigation()
const { t } = useTranslation('components.profile.tabs.ReviewsTab')
// TODO: when no reviews are present, show leave a review button if: user is Logged in (bait if user is not logged? mh sus) and is NOT own profile
// AND user has participated in at least one event of the organization
// const isOwnProfile = useIsOwnProfile(computed(() => props.organizationId))

const reviews = ref<EventReview[]>([])
const loading = ref(true)
const logger = createLogger(import.meta.url)

const loadReviews = async () => {
  try {
    loading.value = true
    reviews.value = (
      await api.interactions.getOrganizationReviews(props.organizationId, {
        pagination: {
          limit: 4,
        },
      })
    ).items
  } catch (error) {
    logger.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

const goToAllReviews = () => {
  window.scrollTo({ top: 0, behavior: 'auto' })
  goToEventReviews(props.organizationId)
}

onMounted(() => {
  loadReviews()
})
</script>

<template>
  <template v-if="loading">
    <div class="loading-state">
      <q-spinner color="primary" size="40px" />
      <span class="loading-text">{{ t('loadingReviews') }}</span>
    </div>
  </template>

  <template v-else-if="reviews.length > 0">
    <div class="reviews-list">
      <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
    </div>
    <SeeAllButton class="view-more-btn" variant="minimal" @click="goToAllReviews" />
  </template>

  <template v-else>
    <div class="empty-state">
      <q-icon name="rate_review" size="48px" />
      <span class="empty-text">{{ t('noReviews') }}</span>
    </div>
  </template>
</template>

<style lang="scss" scoped>
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
  margin-top: $spacing-6;
}
</style>
