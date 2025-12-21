<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import type { Event } from '@/api/types/events'
import ReviewsList from '@/components/reviews/ReviewsList.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import RatingStars from '@/components/reviews/RatingStars.vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

interface Props {
  reviews: EventReview[]
  emptyText: string
  emptyIconName: string
  hasMore?: boolean
  onLoadMore?: () => void | Promise<void>
  organizationId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'reviews-updated': []
}>()

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const showReviewDialog = ref(false)
const organizationEvents = ref<Event[]>([])
const eventOptions = ref<Event[]>([])
const selectedEvent = ref<Event | null>(null)
const newReviewRating = ref<number>(5)
const newReviewTitle = ref('')
const newReviewDescription = ref('')
const submittingReview = ref(false)

const canLeaveReview = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'member'
})

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!props.hasMore || !props.onLoadMore) {
    done(true)
    return
  }

  loading.value = true

  try {
    await props.onLoadMore()
  } finally {
    loading.value = false
    done(!props.hasMore)
  }
}

const loadOrganizationEvents = async () => {
  try {
    const response = await api.events.searchEvents({
      id_organization: props.organizationId,
      status: 'PUBLISHED',
    })
    organizationEvents.value = response.items
  } catch (error) {
    console.error('Failed to load organization events:', error)
  }
}

const filterEvents = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === '') {
      eventOptions.value = organizationEvents.value
    } else {
      const needle = val.toLowerCase()
      eventOptions.value = organizationEvents.value.filter(
        (event) => event.title.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const openReviewDialog = async () => {
  await loadOrganizationEvents()
  eventOptions.value = organizationEvents.value
  newReviewRating.value = 5
  newReviewTitle.value = ''
  newReviewDescription.value = ''
  selectedEvent.value = organizationEvents.value[0] || null
  showReviewDialog.value = true
}

const submitReview = async () => {
  if (
    !selectedEvent.value ||
    newReviewTitle.value.trim() === '' ||
    newReviewDescription.value.trim() === ''
  ) {
    return
  }

  submittingReview.value = true
  try {
    await api.interactions.createEventReview(selectedEvent.value.id_event, {
      userId: authStore.user!.id,
      organizationId: props.organizationId,
      collaboratorsId: [],
      rating: Math.round(newReviewRating.value) as 0 | 1 | 2 | 3 | 4 | 5,
      title: newReviewTitle.value.trim(),
      comment: newReviewDescription.value.trim(),
    })
    showReviewDialog.value = false
    emit('reviews-updated')
  } catch (error) {
    console.error('Failed to submit review:', error)
  } finally {
    submittingReview.value = false
  }
}
</script>

<template>
  <div class="reviews-tab">
    <q-infinite-scroll
      v-if="reviews.length > 0"
      :offset="250"
      class="reviews-scroll"
      :disable="loading"
      @load="onLoad"
    >
      <div class="reviews-container">
        <ReviewsList
          :reviews="reviews"
          :show-event-info="true"
          :show-stats="true"
          :show-add-review-button="canLeaveReview"
          @add-review="openReviewDialog"
        />
      </div>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyTab v-else :emptyText="emptyText" :emptyIconName="emptyIconName" />

    <!-- Review Dialog -->
    <q-dialog v-model="showReviewDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Lascia una recensione</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedEvent"
            :options="eventOptions"
            option-value="id_event"
            option-label="title"
            label="Seleziona evento"
            outlined
            use-input
            hide-selected
            fill-input
            input-debounce="300"
            class="q-mb-md"
            @filter="filterEvents"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey"> Nessun evento trovato </q-item-section>
              </q-item>
            </template>
          </q-select>

          <div class="rating-input">
            <label>{{ t('userProfile.selectRating') }}</label>
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
            :label="t('userProfile.reviewTitle')"
            :placeholder="t('userProfile.reviewTitlePlaceholder')"
            outlined
            class="q-mt-md"
          />

          <q-input
            v-model="newReviewDescription"
            type="textarea"
            :label="t('userProfile.reviewDescription')"
            :placeholder="t('userProfile.reviewDescriptionPlaceholder')"
            rows="5"
            outlined
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="t('userProfile.cancel')" color="primary" />
          <q-btn
            flat
            :label="t('userProfile.submit')"
            color="primary"
            :loading="submittingReview"
            :disable="
              !selectedEvent || newReviewTitle.trim() === '' || newReviewDescription.trim() === ''
            "
            @click="submitReview"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
.reviews-tab {
  @include flex-column;
  height: 100%;
}

.reviews-scroll {
  height: 100%;
}

.reviews-container {
  padding: $spacing-3;
}

.rating-input {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-text-primary;

    @include dark-mode {
      color: $color-heading-dark;
    }
  }
}
</style>
