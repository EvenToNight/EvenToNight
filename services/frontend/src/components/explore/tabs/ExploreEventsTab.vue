<script setup lang="ts">
import { ref } from 'vue'
import type { Event } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'
import EventFiltersButton, {
  type EventFilters,
} from '@/components/explore/filters/FiltersButton.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  events: (Event & { liked?: boolean })[]
  searchQuery: string
  hasMore?: boolean
  onLoadMore?: () => void | Promise<void>
  onAuthRequired?: () => void
}
const loading = ref(false)
const props = defineProps<Props>()

const emit = defineEmits<{
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
          v-for="(event, index) in events"
          :key="event.eventId"
          v-model="events[index]!"
          @auth-required="onAuthRequired?.()"
        />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>
    <EmptyTab
      v-else-if="searchQuery"
      :emptyText="t('explore.events.emptySearch')"
      :emptyIconName="'event_busy'"
    />
    <EmptyTab v-else :emptyText="t('explore.events.emptySearchText')" :emptyIconName="'search'" />
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
</style>
