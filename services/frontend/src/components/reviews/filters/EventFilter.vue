<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Event, EventID } from '@/api/types/events'
import { api } from '@/api'
import type { UserID } from '@/api/types/users'

interface Props {
  organizationId: UserID
}

const props = defineProps<Props>()
const hasSearched = ref(false)
const hasFocus = ref(false)

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
  }
}

const displayValue = computed({
  get(): EventID | null | undefined {
    if (selectedEventId.value === null) {
      if (hasFocus.value) {
        return undefined
      } else {
        return 'Tutti gli eventi'
      }
    }
    console.log('selectedEventId', selectedEventId.value)
    return selectedEventId.value
  },
  set(value: EventID | null | undefined) {
    selectedEventId.value = value ?? null
  },
})

const filterEvents = (query: string, update: (callback: () => void) => void) => {
  if (!query) {
    update(() => {
      const found = eventOptions.value.find((e) => e.eventId === selectedEventId.value)
      eventOptions.value = found ? [found] : []
      hasSearched.value = false
    })
  } else {
    api.events
      .searchEvents({ id_organization: props.organizationId, status: 'PUBLISHED', title: query })
      .then((response) => {
        update(() => {
          hasSearched.value = true
          eventOptions.value = response.items
        })
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
    option-value="id_event"
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
