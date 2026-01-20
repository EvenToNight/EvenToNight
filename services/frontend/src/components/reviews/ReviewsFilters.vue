<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EventID } from '@/api/types/events'
import type { Rating } from '@/api/types/interaction'
import type { UserID } from '@/api/types/users'

import EventFilter from './filters/EventFilter.vue'
import RatingFilter from './filters/RatingFilter.vue'

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
const selectedEventId = ref<EventID | null>(props.selectedEventId)

watch(selectedEventId, (newValue) => {
  emit('update:selectedEventId', newValue)
})

watch(selectedRating, (newValue) => {
  emit('update:selectedRating', newValue)
})
</script>

<template>
  <div class="reviews-filters">
    <EventFilter
      v-model:selectedEventId="selectedEventId"
      :organization-id="props.organizationId"
    />
    <RatingFilter v-model:selectedRating="selectedRating" />
  </div>
</template>

<style lang="scss" scoped>
.reviews-filters {
  padding-top: $spacing-4;
  border-top: 1px solid $color-border;
  display: flex;
  flex-direction: column;

  @include dark-mode {
    border-top-color: $color-border-dark;
  }
}
</style>
