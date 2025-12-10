<script setup lang="ts">
import type { Event } from '@/api/types/events'
import EventCardVariant from '@/components/cards/EventCardVariant.vue'
import EmptyTab from '@/components/profile/tabs/EmptyTab.vue'

interface Props {
  events: Event[]
  emptyText: string
  emptyIconName: string
}

defineProps<Props>()
</script>

<template>
  <div class="event-tab">
    <div v-if="events.length > 0" class="events-grid">
      <EventCardVariant v-for="event in events" :key="event.id" :event="event" />
    </div>

    <template v-else>
      <EmptyTab :emptyText="emptyText" :emptyIconName="emptyIconName" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.event-tab {
  @include flex-column;
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
</style>
