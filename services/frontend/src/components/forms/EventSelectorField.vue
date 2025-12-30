<script setup lang="ts">
import { ref } from 'vue'
import FormSelectorField from './FormSelectorField.vue'
import { api } from '@/api'
import type { EventsQueryParams } from '@/api/interfaces/events'
import type { Event } from '@/api/types/events'

interface Props {
  params: EventsQueryParams
}
const modelValue = defineModel<any>('modelValue', { required: true })
const eventOptions = ref<Event[]>([])
const props = defineProps<Props>()
const hasSearched = ref(false)

const filterEvents = (query: string, update: (callback: () => void) => void) => {
  update(() => {
    if (!query) {
      eventOptions.value = []
      hasSearched.value = false
    } else {
      hasSearched.value = true
      api.events.searchEvents({ ...props.params, title: query }).then((response) => {
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
    modelValue.value = null
  }
}
</script>

<template>
  <FormSelectorField
    v-model="modelValue"
    :options="eventOptions"
    v-bind="$attrs"
    option-value="id_event"
    option-label="title"
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
          {{ hasSearched ? 'Nessun evento trovato' : 'Inizia a digitare per cercare eventi' }}
        </q-item-section>
      </q-item>
    </template>
  </FormSelectorField>
</template>

<style scoped lang="scss">
.event-option-image {
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
  object-fit: cover;
}
</style>
