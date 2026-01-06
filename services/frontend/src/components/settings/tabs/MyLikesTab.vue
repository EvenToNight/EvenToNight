<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'

const ITEMS_PER_PAGE = 12

const authStore = useAuthStore()
const events = ref<Event[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)

const loadLikedEvents = async (isLoadingMore = false) => {
  if (!authStore.user?.id) return

  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const response = await api.interactions.getUserLikedEvents(authStore.user.id, {
      limit: ITEMS_PER_PAGE,
      offset: isLoadingMore ? events.value.length : 0,
    })

    // Load full event details for each event ID
    const eventPromises = response.items.map((eventId) => api.events.getEventById(eventId))
    const loadedEvents = await Promise.all(eventPromises)

    if (isLoadingMore) {
      events.value = [...events.value, ...loadedEvents]
    } else {
      events.value = loadedEvents
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

const handleUnlike = async (eventId: string) => {
  if (!authStore.user?.id) return

  try {
    await api.interactions.unlikeEvent(eventId, authStore.user.id)
    // Remove event from local list
    events.value = events.value.filter((event) => event.eventId !== eventId)
  } catch (error) {
    console.error('Failed to unlike event:', error)
  }
}
</script>

<template>
  <div class="my-likes-tab">
    <q-inner-loading :showing="loading" />

    <template v-if="!loading">
      <q-infinite-scroll
        v-if="events.length > 0"
        :offset="250"
        :disable="loadingMore"
        @load="onLoad"
      >
        <div class="events-grid">
          <EventCard
            v-for="event in events"
            :key="event.eventId"
            :event="event"
            :favorite="true"
            @favorite-toggle="handleUnlike(event.eventId)"
          />
        </div>

        <template #loading>
          <div class="loading-state">
            <q-spinner-dots color="primary" size="50px" />
          </div>
        </template>
      </q-infinite-scroll>

      <EmptyState
        v-else
        empty-icon-name="favorite_border"
        :empty-text="'You have not liked any events yet.'"
        class="empty-state"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.my-likes-tab {
  padding: $spacing-6;
  min-height: 400px;
  position: relative;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $spacing-4;
}

.loading-state {
  @include flex-center;
  padding: $spacing-8;
}

.empty-state {
  padding: $spacing-8 0;
}
</style>
