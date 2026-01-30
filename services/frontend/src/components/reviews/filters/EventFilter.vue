<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Event, EventID } from '@/api/types/events'
import { api } from '@/api'
import type { UserID } from '@/api/types/users'

interface Props {
  organizationId: UserID
}

const props = defineProps<Props>()
const hasSearched = ref(false)
const hasFocus = ref(false)
const isFiltering = ref(false)

const selectedEventId = defineModel<EventID | null>('selectedEventId', { required: true })
const eventOptions = ref<Event[]>([])

const loadInitialEvent = async () => {
  if (selectedEventId.value) {
    try {
      const event = await api.events.getEventById(selectedEventId.value)
      eventOptions.value = [event]
    } catch (error) {
      console.error('Failed to load initial event:', error)
    }
  } else {
    isFiltering.value = true
  }
}

watch(selectedEventId, async (newEventId) => {
  if (newEventId === null) {
    const events = await api.events.searchEvents({
      organizationId: props.organizationId,
      status: 'COMPLETED',
      pagination: { limit: 5 },
    })
    eventOptions.value = events.items
    isFiltering.value = true
  }
})

const displayValue = computed({
  get(): EventID | null | undefined {
    if (selectedEventId.value === null) {
      if (hasFocus.value) {
        return undefined
      } else {
        return 'Tutti gli eventi'
      }
    }
    return selectedEventId.value
  },
  set(value: EventID | null | undefined) {
    selectedEventId.value = value ?? null
  },
})

const filterEvents = async (query: string, update: (callback: () => void) => void) => {
  if (!query) {
    if (selectedEventId.value) {
      console.log('Filtering to selected event only')
      update(() => {
        isFiltering.value = true
        const found = eventOptions.value.find((e) => e.eventId === selectedEventId.value)
        if (found) {
          eventOptions.value = [found]
        }
        hasSearched.value = false
      })
    } else if (isFiltering.value) {
      const events = await api.events.searchEvents({
        organizationId: props.organizationId,
        status: 'COMPLETED',
        pagination: { limit: 5 },
      })
      update(() => {
        isFiltering.value = false
        hasSearched.value = false
        eventOptions.value = events.items
      })
    } else {
      // Eventi già caricati, usa solo update senza ricaricare
      update(() => {
        hasSearched.value = false
      })
    }
  } else {
    console.log('Searching events with query:', query)
    const response = await api.events.searchEvents({
      organizationId: props.organizationId,
      status: 'COMPLETED',
      title: query,
    })
    update(() => {
      isFiltering.value = true
      hasSearched.value = true
      eventOptions.value = response.items
    })
  }
}

onMounted(() => {
  loadInitialEvent()
})
</script>

<template>
  <q-select
    v-model="displayValue"
    :options="eventOptions"
    option-value="eventId"
    option-label="title"
    label="Filtra per evento"
    outlined
    use-input
    hide-selected
    fill-input
    map-options
    emit-value
    input-debounce="300"
    :clearable="selectedEventId !== null"
    @focus="hasFocus = true"
    @blur="hasFocus = false"
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
        <q-item-section class="text-grey">
          {{ hasSearched ? 'Nessun evento trovato' : 'Inizia a digitare per cercare eventi' }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<style lang="scss" scoped>
.event-option-image {
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
  object-fit: cover;
}
</style>
