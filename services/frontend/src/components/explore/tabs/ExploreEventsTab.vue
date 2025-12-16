<script setup lang="ts">
import type { Event } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'

interface Props {
  events: Event[]
  loading: boolean
  searchQuery: string
}

defineProps<Props>()

const emit = defineEmits<{
  'favorite-toggle': [eventId: string, isFavorite: boolean]
  'auth-required': []
}>()
</script>

<template>
  <div class="tab-content">
    <div v-if="loading" class="loading-state">
      <q-spinner-dots color="primary" size="50px" />
    </div>
    <div v-else-if="events.length > 0" class="events-grid">
      <EventCard
        v-for="event in events"
        :key="event.id_event"
        :event="event"
        :favorite="false"
        @favorite-toggle="emit('favorite-toggle', event.id_event, $event)"
        @auth-required="emit('auth-required')"
      />
    </div>
    <div v-else-if="searchQuery" class="empty-state">
      <q-icon name="event_busy" size="64px" color="grey-5" />
      <p class="empty-text">Nessun evento trovato</p>
    </div>
    <div v-else class="empty-state">
      <q-icon name="search" size="64px" color="grey-5" />
      <p class="empty-text">Cerca eventi per nome</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-content {
  @include flex-column;
  gap: $spacing-4;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}

.loading-state {
  @include flex-center;
  padding: $spacing-8;
}

.empty-state {
  @include flex-column;
  @include flex-center;
  gap: $spacing-4;
  padding: $spacing-8;
  text-align: center;
}

.empty-text {
  color: $color-gray-500;
  margin: 0;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
}
</style>
