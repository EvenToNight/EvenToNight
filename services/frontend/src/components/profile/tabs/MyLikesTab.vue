<script setup lang="ts">
import { onMounted } from 'vue'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { loadLikedEvents, type EventLoadResult } from '@/api/utils/eventUtils'
import type { UserID } from '@/api/types/users'
const ITEMS_PER_PAGE = 20
interface Props {
  userId: UserID
}
const props = defineProps<Props>()

const {
  items: events,
  loading,
  loadingMore,
  onLoad,
  loadItems,
} = useInfiniteScroll<{ userId: UserID }, EventLoadResult>({
  itemsPerPage: ITEMS_PER_PAGE,
  options: { userId: props.userId },
  loadFn: async (limit, offset, options) => {
    return loadLikedEvents(options!.userId, { limit, offset })
  },
})

onMounted(() => {
  loadItems()
})
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
