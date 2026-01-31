<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import EventCard from '@/components/cards/EventCard.vue'
import EventFiltersButton, {
  type EventFilters,
} from '@/components/explore/filters/FiltersButton.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import { useI18n } from 'vue-i18n'
import type { PaginatedRequest, PaginatedResponse } from '@/api/interfaces/commons'
import type { EventLoadResult } from '@/api/utils/eventUtils'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { defaultLimit } from '@/api/utils/requestUtils'

const { t } = useI18n()

interface Props {
  searchQuery: string
  loadFn: (
    eventFilters: EventFilters | undefined,
    pagination: PaginatedRequest
  ) => Promise<PaginatedResponse<EventLoadResult>>
  onAuthRequired?: () => void
}

const props = defineProps<Props>()
const eventFilters = ref<EventFilters | undefined>(undefined)

const {
  items: events,
  // loading,
  loadingMore,
  onLoad,
  loadItems,
  reload,
} = useInfiniteScroll<undefined, EventLoadResult>({
  itemsPerPage: defaultLimit,
  loadFn: async (limit, offset) => {
    return props.loadFn(eventFilters.value, { limit, offset })
  },
})

onMounted(() => {
  loadItems()
})

watch(
  () => props.searchQuery,
  () => {
    reload()
  }
)

watch(eventFilters, () => {
  reload()
})
</script>

<template>
  <div class="tab-content">
    <EventFiltersButton v-model="eventFilters" />

    <q-infinite-scroll
      v-if="events.length > 0"
      :offset="250"
      class="events-scroll"
      :disable="loadingMore"
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
