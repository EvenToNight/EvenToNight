<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Event, EventStatus } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import type { PaginatedResponse } from '@/api/interfaces/commons'

const ITEMS_PER_PAGE = 10

interface Props {
  loadEvents: (
    status: EventStatus,
    offset: number,
    limit: number,
    sortOrder: 'asc' | 'desc'
  ) => Promise<PaginatedResponse<Event & { liked: boolean }>>
  emptyText?: string
  emptyIconName?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: 'No events found',
  emptyIconName: 'event',
})

const publishedEvents = ref<(Event & { liked: boolean })[]>([])
const completedEvents = ref<(Event & { liked: boolean })[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMorePublished = ref(true)
const hasMoreCompleted = ref(true)
const loadingStatus = ref<'PUBLISHED' | 'COMPLETED'>('PUBLISHED')

const allEvents = computed(() => [...publishedEvents.value, ...completedEvents.value])
const hasMore = computed(() => hasMorePublished.value || hasMoreCompleted.value)

const loadMoreEvents = async (isLoadingMore = false) => {
  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    // Load published events first
    if (hasMorePublished.value && loadingStatus.value === 'PUBLISHED') {
      const response = await props.loadEvents(
        'PUBLISHED',
        publishedEvents.value.length,
        ITEMS_PER_PAGE,
        'asc'
      )
      console.log('Loaded published events:', response)

      publishedEvents.value = [...publishedEvents.value, ...response.items]
      hasMorePublished.value = response.hasMore

      // Switch to completed when published are done
      if (!hasMorePublished.value) {
        loadingStatus.value = 'COMPLETED'
      }
    }
    // Then load completed events
    else if (hasMoreCompleted.value && loadingStatus.value === 'COMPLETED') {
      const response = await props.loadEvents(
        'COMPLETED',
        completedEvents.value.length,
        ITEMS_PER_PAGE,
        'desc'
      )

      completedEvents.value = [...completedEvents.value, ...response.items]
      hasMoreCompleted.value = response.hasMore
    }
  } catch (error) {
    console.error('Failed to load events:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!hasMore.value) {
    done(true)
    return
  }

  try {
    await loadMoreEvents(true)
  } finally {
    done(!hasMore.value)
  }
}

onMounted(() => {
  loadMoreEvents()
})

defineExpose({
  reload: () => {
    publishedEvents.value = []
    completedEvents.value = []
    hasMorePublished.value = true
    hasMoreCompleted.value = true
    loadingStatus.value = 'PUBLISHED'
    loadMoreEvents()
  },
})
</script>

<template>
  <div class="event-tab">
    <q-inner-loading :showing="loading && allEvents.length === 0">
      <q-spinner-dots color="primary" size="50px" />
    </q-inner-loading>

    <q-infinite-scroll
      v-if="!loading && allEvents.length > 0"
      :offset="250"
      class="events-scroll"
      :disable="loadingMore || !hasMore"
      @load="onLoad"
    >
      <!-- Published Events Section -->
      <div v-if="publishedEvents.length > 0" class="events-section">
        <h3 class="section-label">Prossimamente</h3>
        <div class="events-grid">
          <EventCard
            v-for="(event, index) in publishedEvents"
            :key="event.eventId"
            v-model="publishedEvents[index]!"
          />
        </div>
      </div>

      <!-- Completed Events Section -->
      <div v-if="completedEvents.length > 0" class="events-section">
        <h3 class="section-label">Passati</h3>
        <div class="events-grid">
          <EventCard
            v-for="(event, index) in completedEvents"
            :key="event.eventId"
            v-model="completedEvents[index]!"
          />
        </div>
      </div>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyTab
      v-else-if="!loading && allEvents.length === 0"
      :empty-text="emptyText"
      :empty-icon-name="emptyIconName"
    />
  </div>
</template>

<style lang="scss" scoped>
.event-tab {
  @include flex-column;
  height: 100%;
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
</style>
