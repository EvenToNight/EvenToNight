<script setup lang="ts">
import { onMounted } from 'vue'
import type { EventStatus } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import type { PaginatedResponse, SortOrder } from '@/api/interfaces/commons'
import type { EventLoadResult } from '@/api/utils/eventUtils'
import {
  useMultiSectionInfiniteScroll,
  type SectionConfig,
} from '@/composables/useMultiSectionInfiniteScroll'

const ITEMS_PER_PAGE = 10

interface SectionOptions {
  status: EventStatus | Set<EventStatus>
  label?: string
  sortOrder: SortOrder
  startDate?: Date
  endDate?: Date
}

interface Props {
  sections: SectionConfig<EventStatus, SectionOptions>[]
  loadEvents: (
    status: EventStatus | Set<EventStatus>,
    offset: number,
    limit: number,
    sortOrder: SortOrder,
    startDate?: Date,
    endDate?: Date
  ) => Promise<PaginatedResponse<EventLoadResult>>
  onAuthRequired?: () => void
  emptyText: string
  emptyIconName: string
}

const props = defineProps<Props>()

const { sectionsData, loading, loadingMore, hasMore, isEmpty, onLoad, loadMore, reload } =
  useMultiSectionInfiniteScroll<EventStatus, SectionOptions, EventLoadResult>({
    sections: props.sections,
    itemsPerPage: ITEMS_PER_PAGE,
    loadFn: async (_key, offset, limit, options) => {
      return props.loadEvents(
        options!.status,
        offset,
        limit,
        options!.sortOrder,
        options!.startDate,
        options!.endDate
      )
    },
  })

onMounted(() => {
  loadMore()
})

defineExpose({
  reload,
})
</script>

<template>
  <div class="event-tab">
    <div v-if="loading && isEmpty" class="initial-loading">
      <q-spinner color="primary" size="50px" />
    </div>

    <q-infinite-scroll
      v-else-if="!isEmpty"
      :offset="250"
      class="events-scroll"
      :disable="loadingMore || !hasMore"
      @load="onLoad"
    >
      <div
        v-for="section in sections"
        v-show="sectionsData[section.key].items.length > 0"
        :key="section.key"
        class="events-section"
      >
        <h2 v-if="section.options?.label" class="section-label">
          {{ section.options.label }}
        </h2>
        <div class="events-grid">
          <EventCard
            v-for="(event, index) in sectionsData[section.key].items"
            :key="event.eventId"
            v-model="sectionsData[section.key].items[index]!"
            @auth-required="props.onAuthRequired?.()"
          />
        </div>
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyTab
      v-else-if="!loading && isEmpty"
      :empty-text="emptyText"
      :empty-icon-name="emptyIconName"
    />
  </div>
</template>

<style lang="scss" scoped>
.event-tab {
  @include flex-column;
  height: 100%;
  position: relative;
}

.initial-loading {
  @include flex-center;
}

.events-scroll {
  height: 100%;
}

.events-section {
  margin-bottom: $spacing-6;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin: 0 0 $spacing-4;
  padding: 0 $spacing-3;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;
  padding: 0 $spacing-3 $spacing-3;

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}

.loading-state {
  @include flex-center;
  flex: 1;
}
</style>
