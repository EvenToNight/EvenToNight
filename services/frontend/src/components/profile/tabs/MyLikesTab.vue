<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'

const ITEMS_PER_PAGE = 12

const authStore = useAuthStore()
const events = ref<(Event & { liked: boolean })[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)

const loadLikedEvents = async (isLoadingMore = false) => {
  if (!authStore.isAuthenticated) return

  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const response = await api.interactions.getUserLikedEvents(authStore.user!.id, {
      limit: ITEMS_PER_PAGE,
      offset: isLoadingMore ? events.value.length : 0,
    })

    // Load full event details for each event ID
    const eventPromises = response.items.map((eventId) => api.events.getEventById(eventId))
    const loadedEvents = await Promise.all(eventPromises)

    if (isLoadingMore) {
      events.value = [...events.value, ...loadedEvents.map((event) => ({ ...event, liked: true }))]
    } else {
      events.value = loadedEvents.map((event) => ({ ...event, liked: true }))
    }

    hasMore.value = response.hasMore
  } catch (error) {
    console.error('Failed to load liked events:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

onMounted(() => {
  loadLikedEvents()
})

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!hasMore.value) {
    done(true)
    return
  }

  try {
    await loadLikedEvents(true)
  } finally {
    done(!hasMore.value)
  }
}
</script>

<template>
  <div class="my-likes-tab">
    <q-infinite-scroll
      v-if="!loading && events.length > 0"
      :offset="250"
      class="events-scroll"
      :disable="loadingMore"
      @load="onLoad"
    >
      <div class="events-grid">
        <EventCard v-for="(event, index) in events" :key="event.eventId" v-model="events[index]!" />
      </div>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyState
      v-else-if="!loading"
      empty-icon-name="favorite_border"
      :empty-text="'You have not liked any events yet.'"
    />
  </div>
</template>

<style lang="scss" scoped>
.my-likes-tab {
  @include flex-column;
  height: 100%;
}

.events-scroll {
  height: 100%;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;
  padding: $spacing-3;

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}
</style>
