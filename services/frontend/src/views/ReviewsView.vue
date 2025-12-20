<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { EventReview } from '@/api/types/interaction'
import ReviewsList from '@/components/reviews/ReviewsList.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import RatingStars from '@/components/reviews/RatingStars.vue'

const { params, goToEventDetails } = useNavigation()

const eventId = computed(() => params.id as string)
const reviews = ref<EventReview[]>([])
const loading = ref(true)
const eventTitle = ref<string>('')

// Review dialog
const showReviewDialog = ref(false)
const newReviewRating = ref<number>(5)
const newReviewTitle = ref('')
const newReviewDescription = ref('')
const submittingReview = ref(false)

const loadReviews = async () => {
  loading.value = true
  try {
    reviews.value = await api.interactions.getEventReviews(eventId.value)
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
  } catch (error) {
    console.error('Failed to load event:', error)
  }
}

const openReviewDialog = () => {
  newReviewRating.value = 5
  newReviewTitle.value = ''
  newReviewDescription.value = ''
  showReviewDialog.value = true
}

const submitReview = async () => {
  if (newReviewTitle.value.trim() === '' || newReviewDescription.value.trim() === '') {
    return
  }

  submittingReview.value = true
  try {
    await api.interactions.createEventReview(eventId.value, {
      userId: 'current-user-id', // TODO: Get from auth context
      organizationId: 'org-1', // TODO: Get from event
      collaboratorsId: [],
      rating: Math.round(newReviewRating.value) as 0 | 1 | 2 | 3 | 4 | 5,
      title: newReviewTitle.value.trim(),
      comment: newReviewDescription.value.trim(),
    })
    showReviewDialog.value = false
    await loadReviews()
  } catch (error) {
    console.error('Failed to submit review:', error)
  } finally {
    submittingReview.value = false
  }
}

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
          <button class="back-button" @click="goToEventDetails(eventId)">
            <q-icon name="arrow_back" />
            Back to Event
          </button>
          <div class="title-row">
            <h1 class="page-title">Reviews for {{ eventTitle }}</h1>
            <button class="add-review-btn" @click="openReviewDialog">
              <q-icon name="rate_review" />
              Lascia una recensione
            </button>
          </div>
        </div>

        <ReviewsList :reviews="reviews" :loading="loading" />
      </div>
    </div>

    <!-- Review Dialog -->
    <q-dialog v-model="showReviewDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Lascia una recensione</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="rating-input">
            <label>Seleziona il rating:</label>
            <RatingStars
              :rating="newReviewRating"
              size="lg"
              :show-number="true"
              :editable="true"
              @update:rating="newReviewRating = $event"
            />
          </div>

          <q-input
            v-model="newReviewTitle"
            label="Titolo"
            placeholder="Dai un titolo alla tua recensione..."
            outlined
            class="q-mt-md"
          />

          <q-input
            v-model="newReviewDescription"
            type="textarea"
            label="Descrizione"
            placeholder="Scrivi la tua recensione..."
            rows="5"
            outlined
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Annulla" color="primary" />
          <q-btn
            flat
            label="Invia"
            color="primary"
            :loading="submittingReview"
            :disable="newReviewTitle.trim() === '' || newReviewDescription.trim() === ''"
            @click="submitReview"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-4;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    align-items: flex-start;
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

.back-button {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  margin-bottom: $spacing-4;
  background: transparent;
  border: none;
  color: $color-primary;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    color: $color-primary-dark;
    transform: translateX(-4px);
  }

  .q-icon {
    font-size: 1.25rem;
  }
}

.page-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0;

  @include dark-mode {
    color: $color-heading-dark;
  }
}
</style>
