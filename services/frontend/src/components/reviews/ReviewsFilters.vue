<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Event, EventID } from '@/api/types/events'
import type { Rating } from '@/api/types/interaction'
import { api } from '@/api'
import type { UserID } from '@/api/types/users'

interface Props {
  selectedEventId: EventID | null
  selectedRating: Rating | null
  organizationId: UserID
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedEventId': [selectedEventId: EventID | null]
  'update:selectedRating': [selectedRating: Rating | null]
}>()

const selectedRating = ref<Rating | null>(props.selectedRating)
const ratingOptions = ref<Array<{ label: string; value: number | null }>>([])

const selectedEventId = ref<EventID | null>(props.selectedEventId)
const eventOptions = ref<Event[]>([])

watch(selectedEventId, (newValue) => {
  console.log(newValue)
  emit('update:selectedEventId', newValue)
})

watch(selectedRating, (newValue) => {
  console.log(newValue)
  emit('update:selectedRating', newValue)
})
const allRatingOptions = computed(() => {
  return [
    { label: 'Tutte le stelle', value: null },
    { label: '5 Stelle', value: 5 },
    { label: '4 Stelle', value: 4 },
    { label: '3 Stelle', value: 3 },
    { label: '2 Stelle', value: 2 },
    { label: '1 Stella', value: 1 },
  ]
})

const filterEvents = (query: string, update: (callback: () => void) => void) => {
  update(() => {
    if (!query) {
      eventOptions.value = []
    } else {
      api.events
        .searchEvents({ id_organization: props.organizationId, status: 'PUBLISHED', title: query })
        .then((response) => {
          eventOptions.value = response.items
        })
      console.log(eventOptions.value)
      console.log(props.organizationId)
      const needle = query.toLowerCase()
      eventOptions.value = eventOptions.value.filter(
        (event) => event.title.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const filterRatings = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === '') {
      ratingOptions.value = allRatingOptions.value
    } else {
      const needle = val.toLowerCase()
      ratingOptions.value = allRatingOptions.value.filter(
        (option) => option.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}
</script>

<template>
  <div class="reviews-filters">
    <div class="filter-group">
      <q-select
        v-model="selectedEventId"
        :options="eventOptions"
        option-value="id_event"
        option-label="title"
        label="Filtra per evento"
        outlined
        use-input
        hide-selected
        fill-input
        input-debounce="300"
        :clearable="selectedEventId !== null"
        @filter="filterEvents"
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
            <q-item-section class="text-grey"> Nessun evento trovato </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <div class="filter-group">
      <q-select
        v-model="selectedRating"
        :options="ratingOptions"
        option-value="value"
        option-label="label"
        label="Filtra per stelle"
        :clearable="selectedRating !== null"
        outlined
        use-input
        hide-selected
        fill-input
        input-debounce="300"
        emit-value
        map-options
        @filter="filterRatings"
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey"> Nessuna opzione trovata </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reviews-filters {
  padding-top: $spacing-4;
  border-top: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  gap: $spacing-4;

  @include dark-mode {
    border-top-color: $color-border-dark;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.event-option-image {
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
  object-fit: cover;
}
</style>
