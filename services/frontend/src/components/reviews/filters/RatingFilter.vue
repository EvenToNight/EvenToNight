<script setup lang="ts">
import { ref } from 'vue'
import type { Rating } from '@/api/types/interaction'
import { RATING_VALUES } from '@/api/types/interaction'
import FormSelectorField from '@/components/forms/FormSelectorField.vue'

const selectedRating = defineModel<Rating | null>('selectedRating', { required: true })

const allRatingOptions = [
  { label: 'Tutte le stelle', value: null },
  ...[...RATING_VALUES].reverse().map((rating) => ({
    label: rating === 1 ? '1 Stella' : `${rating} Stelle`,
    value: rating,
  })),
]

const ratingOptions = ref<Array<{ label: string; value: number | null }>>(allRatingOptions)

const filterRatings = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === '') {
      ratingOptions.value = allRatingOptions
    } else {
      const needle = val.toLowerCase()
      ratingOptions.value = allRatingOptions.filter(
        (option: { label: string; value: number | null }) =>
          option.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}
</script>

<template>
  <FormSelectorField
    v-model="selectedRating"
    :options="ratingOptions"
    option-value="value"
    option-label="label"
    label="Filtra per stelle"
    use-input
    hide-selected
    fill-input
    emit-value
    map-options
    @filter="filterRatings"
  >
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey"> Nessuna opzione trovata </q-item-section>
      </q-item>
    </template>
  </FormSelectorField>
</template>
