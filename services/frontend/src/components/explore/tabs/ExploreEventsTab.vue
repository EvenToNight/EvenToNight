<script setup lang="ts">
import { ref } from 'vue'
import type { Event } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'
import EventFiltersButton, { type EventFilters } from '@/components/explore/EventFiltersButton.vue'

interface Props {
  events: { event: Event; isFavorite: boolean }[]
  searchQuery: string
  hasMore?: boolean
  onLoadMore?: () => void | Promise<void>
}
const loading = ref(false)
const props = defineProps<Props>()

const emit = defineEmits<{
  'favorite-toggle': [eventId: string, isFavorite: boolean]
  'auth-required': []
  'filters-changed': [filters: EventFilters]
}>()

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!props.hasMore || !props.onLoadMore) {
    done(true)
    return
  }

  loading.value = true

  try {
    await props.onLoadMore()
  } finally {
    loading.value = false
    done(!props.hasMore)
  }
}
</script>

<template>
  <div class="tab-content">
    <EventFiltersButton @filters-changed="emit('filters-changed', $event)" />

    <q-infinite-scroll
      v-if="events.length > 0"
      :offset="250"
      class="events-scroll"
      :disable="loading"
      @load="onLoad"
    >
      <div class="events-grid">
        <EventCard
          v-for="item in events"
          :key="item.event.id_event"
          :event="item.event"
          :isFavorite="item.isFavorite"
          @favorite-toggle="emit('favorite-toggle', item.event.id_event, $event)"
          @auth-required="emit('auth-required')"
        />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>
    <div v-else-if="searchQuery" class="empty-state">
      <q-icon name="event_busy" size="64px" color="grey-5" />
      <p class="empty-text">Nessun evento trovato</p>
    </div>
    <div v-else class="empty-state">
      <q-icon name="search" size="64px" color="grey-5" />
      <p class="empty-text">Cerca eventi per nome</p>
    </div>
    <!-- <EmptyTab v-else :emptyText="emptyText" :emptyIconName="emptyIconName" /> -->
  </div>
</template>

<style lang="scss" scoped>
.tab-content {
  @include flex-column;
  gap: $spacing-4;
}

.events-scroll {
  height: 100%;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    // grid-template-columns: 1fr;
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
