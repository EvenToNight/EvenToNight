<script setup lang="ts">
import { ref, watch, inject } from 'vue'
import { api } from '@/api'
import type { Event, EventID } from '@/api/types/events'
import { useAuthStore } from '@/stores/auth'
import type { Rating, EventReview } from '@/api/types/interaction'
import RatingStars from './ratings/RatingStars.vue'
import { useI18n } from 'vue-i18n'
import { required, notEmpty } from '@/components/forms/validationUtils'
import FormField from '../forms/FormField.vue'
import FormSelectorField from '../forms/FormSelectorField.vue'

const { t } = useI18n()
const authStore = useAuthStore()

interface Props {
  creatorId: string
  selectedEventId?: EventID
  existingReview?: EventReview
}

const props = withDefaults(defineProps<Props>(), {
  selectedEventId: undefined,
  existingReview: undefined,
})
const isOpen = defineModel<boolean>('isOpen', { required: true })

const selectedEvent = ref<Event | null>(null)
const updateReview = inject<((eventId: string, userId: string) => void) | undefined>(
  'updateReview',
  undefined
)
// Watch for selectedEventId prop changes and load the event
watch(
  () => props.selectedEventId,
  async (eventId) => {
    if (!eventId) {
      selectedEvent.value = null
      return
    }

    try {
      const event = await api.events.getEventById(eventId)
      selectedEvent.value = event
      eventOptions.value = [event]
    } catch (error) {
      console.error('Failed to load event:', error)
      selectedEvent.value = null
    }
  },
  { immediate: true }
)
const eventOptions = ref<Event[]>([])
const hasSearched = ref(false)

const rating = ref<Rating>(props.existingReview?.rating ?? 5)
const reviewTitle = ref(props.existingReview?.title ?? '')
const reviewDescription = ref(props.existingReview?.comment ?? '')

//TODO: search completed event where user has partecipated
const filterEvents = (query: string, update: (callback: () => void) => void) => {
  update(() => {
    if (!query) {
      eventOptions.value = []
      hasSearched.value = false
    } else {
      hasSearched.value = true
      api.events
        .searchEvents({ organizationId: props.creatorId, status: 'COMPLETED', title: query })
        .then((response) => {
          eventOptions.value = response.items
        })
      const needle = query.toLowerCase()
      eventOptions.value = eventOptions.value.filter(
        (event) => event.title.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const handleInputValue = (val: string) => {
  if (!val || val.trim() === '') {
    selectedEvent.value = null
  }
}

const submittingReview = ref(false)
const submitReview = async () => {
  submittingReview.value = true
  try {
    const reviewData = {
      userId: authStore.user!.id,
      creatorId: props.creatorId,
      collaboratorsId: [],
      rating: rating.value,
      title: reviewTitle.value,
      comment: reviewDescription.value,
    }

    if (props.existingReview) {
      // Update existing review
      await api.interactions.updateEventReview(
        props.existingReview.eventId,
        props.existingReview.userId,
        reviewData
      )
      updateReview?.(props.existingReview.eventId, props.existingReview.userId)
    } else {
      // Create new review
      await api.interactions.createEventReview(selectedEvent.value!.eventId, reviewData)
    }

    isOpen.value = false
  } catch (error) {
    console.error('Failed to submit review:', error)
  } finally {
    submittingReview.value = false
  }
}
</script>
<template>
  <q-dialog v-model="isOpen">
    <q-card class="modal-dialog relative-position">
      <q-card-section>
        <div v-if="existingReview" class="text-h6">Modifica la tua recensione</div>
        <div v-else class="text-h6">Lascia una recensione</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form greedy @submit.prevent="submitReview">
          <FormSelectorField
            v-model="selectedEvent"
            :options="eventOptions"
            option-value="eventId"
            option-label="title"
            label="Seleziona evento"
            :rules="[required('Seleziona un evento')]"
            :disable="!!existingReview"
            use-input
            hide-selected
            fill-input
            @filter="filterEvents"
            @input-value="handleInputValue"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section v-if="scope.opt.poster" avatar>
                  <img :src="scope.opt.poster" alt="Event poster" class="event-option-image" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.title }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{
                    hasSearched ? 'Nessun evento trovato' : 'Inizia a digitare per cercare eventi'
                  }}
                </q-item-section>
              </q-item>
            </template>
          </FormSelectorField>

          <div class="rating-input">
            <label>{{ t('userProfile.selectRating') }}</label>
            <RatingStars
              v-model:rating="rating"
              :show-number="true"
              :editable="true"
              variant="compact"
            />
          </div>

          <FormField
            v-model="reviewTitle"
            :label="t('userProfile.reviewTitle')"
            :placeholder="t('userProfile.reviewTitlePlaceholder')"
            :rules="[notEmpty('Inserisci un titolo per la recensione')]"
            :disable="!!existingReview"
          />

          <FormField
            v-model="reviewDescription"
            type="textarea"
            :label="t('userProfile.reviewDescription')"
            :placeholder="t('userProfile.reviewDescriptionPlaceholder')"
            :rules="[notEmpty('Inserisci una descrizione per la recensione')]"
            rows="5"
          />

          <q-card-actions align="right" class="q-px-none q-pb-none">
            <q-btn v-close-popup flat :label="t('userProfile.cancel')" color="black" />
            <q-btn
              type="submit"
              flat
              :label="t('userProfile.submit')"
              color="primary"
              :loading="submittingReview"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.event-option-image {
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
  object-fit: cover;
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
.modal-dialog {
  max-width: $modal-max-width;
  width: calc(100% - #{$spacing-4 * 2});
  border-radius: $radius-2xl;
  @media (max-width: $app-min-width) {
    position: absolute;
    border-radius: 0;
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
  }
}
</style>
