<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useAuthStore } from '@/stores/auth'
import type { Rating } from '@/api/types/interaction'
import RatingStars from './RatingStars.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()

interface Props {
  isOpen: boolean
  creatorId: string
  selectedEvent?: Event
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const modelValue = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    console.log('Emitting update:isOpen with value:', value)
    emit('update:isOpen', value)
  },
})

const selectedEvent = ref<Event | null>(props.selectedEvent ?? null)
const eventOptions = ref<Event[]>([])
const formRef = ref()
const hasSearched = ref(false)

const rating = ref<Rating>(5)

// Validation rules
const required = (msg: string) => (val: any) => !!val || msg
const notEmpty = (msg: string) => (val: string) => (val && val.trim()) || msg
const reviewDescription = ref('')

const filterEvents = (query: string, update: (callback: () => void) => void) => {
  update(() => {
    if (!query) {
      eventOptions.value = []
      hasSearched.value = false
    } else {
      hasSearched.value = true
      api.events
        .searchEvents({ id_organization: props.creatorId, status: 'PUBLISHED', title: query })
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

const reviewTitle = ref('')

const submittingReview = ref(false)
const submitReview = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) {
    return
  }

  submittingReview.value = true
  try {
    await api.interactions.createEventReview(selectedEvent.value!.id_event, {
      userId: authStore.user!.id,
      organizationId: props.creatorId,
      collaboratorsId: [],
      rating: 5,
      title: 'TITLE',
      comment: 'COMMENT',
    })
    modelValue.value = false
  } catch (error) {
    console.error('Failed to submit review:', error)
  } finally {
    submittingReview.value = false
  }
}
</script>
<template>
  <q-dialog v-model="modelValue">
    <q-card class="cropper-dialog">
      <q-card-section>
        <div class="text-h6">Lascia una recensione</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form ref="formRef" greedy>
          <q-select
            v-model="selectedEvent"
            :options="eventOptions"
            option-value="id_event"
            option-label="title"
            label="Seleziona evento"
            :rules="[required('Seleziona un evento')]"
            lazy-rules="ondemand"
            hide-bottom-space
            outlined
            use-input
            hide-selected
            fill-input
            input-debounce="300"
            class="q-mb-md"
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
          </q-select>

          <div class="rating-input">
            <label>{{ t('userProfile.selectRating') }}</label>
            <RatingStars
              v-model:rating="rating"
              size="lg"
              :show-number="true"
              :editable="true"
              variant="compact"
            />
          </div>

          <q-input
            v-model="reviewTitle"
            :label="t('userProfile.reviewTitle')"
            :placeholder="t('userProfile.reviewTitlePlaceholder')"
            :rules="[notEmpty('Inserisci un titolo per la recensione')]"
            lazy-rules="ondemand"
            hide-bottom-space
            outlined
            class="q-mt-md"
          />

          <q-input
            v-model="reviewDescription"
            type="textarea"
            :label="t('userProfile.reviewDescription')"
            :placeholder="t('userProfile.reviewDescriptionPlaceholder')"
            :rules="[notEmpty('Inserisci una descrizione per la recensione')]"
            lazy-rules="ondemand"
            hide-bottom-space
            rows="5"
            outlined
            class="q-mt-md"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat :label="t('userProfile.cancel')" color="primary" />
        <q-btn
          flat
          :label="t('userProfile.submit')"
          color="primary"
          :loading="submittingReview"
          @click="submitReview"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.cropper-dialog {
  max-width: 400px;
  width: calc(100% - #{$spacing-4 * 2});
  border-radius: $radius-2xl;
  position: relative;

  @media (max-width: $app-min-width) {
    position: absolute;
    border-radius: 0;
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
  }
}

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
</style>
