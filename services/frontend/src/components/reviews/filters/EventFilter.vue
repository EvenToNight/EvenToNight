<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Event, EventID } from '@/api/types/events'
import { api } from '@/api'
import type { UserID } from '@/api/types/users'

interface Props {
  selectedEventId: EventID | null
  organizationId: UserID
}

const props = defineProps<Props>()
const hasSearched = ref(false)
const hasFocus = ref(false)

const emit = defineEmits<{
  'update:selectedEventId': [selectedEventId: EventID | null]
}>()

const selectedEventId = ref<EventID | null>(props.selectedEventId)
const eventOptions = ref<Event[]>([])

watch(selectedEventId, (newValue) => {
  emit('update:selectedEventId', newValue)
})

const displayValue = computed({
  get(): EventID | null | undefined {
    if (hasFocus.value && selectedEventId.value === null) {
      return undefined
    }
    return selectedEventId.value
  },
  set(value: EventID | null | undefined) {
    selectedEventId.value = value ?? null
  },
})

const focusGained = () => {
  hasFocus.value = true
}

const focusLost = () => {
  hasFocus.value = false
  if (!selectedEventId.value) {
    selectedEventId.value = null
  }
}

const allEventOptions = computed(() => {
  const options: Array<{ title: string; id_event: string | null; poster?: string }> = []

  if (!hasFocus.value) {
    options.push({ title: 'Tutti gli eventi', id_event: null })
  }

  eventOptions.value.forEach((event) => {
    if (event) {
      options.push({ title: event.title, id_event: event.id_event, poster: event.poster })
    }
  })
  return options
})

const filterEvents = (query: string, update: (callback: () => void) => void) => {
  if (!query) {
    update(() => {
      const found = eventOptions.value.find((e) => e.id_event === selectedEventId.value)
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
</script>

<template>
  <q-select
    v-model="displayValue"
    :options="allEventOptions"
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
    @focus="focusGained"
    @blur="focusLost"
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
