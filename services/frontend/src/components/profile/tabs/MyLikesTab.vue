<script setup lang="ts">
import { onMounted } from 'vue'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { loadLikedEvents, type EventLoadResult } from '@/api/utils/eventUtils'
import type { UserID } from '@/api/types/users'
import { defaultLimit } from '@/api/utils/requestUtils'
import { useAuthStore } from '@/stores/auth'
import { useTranslation } from '@/composables/useTranslation'
interface Props {
  userId: UserID
}
const props = defineProps<Props>()
const { t } = useTranslation('components.profile.tabs.MyLikesTab')

const authStore = useAuthStore()

const {
  items: events,
  loading,
  loadingMore,
  onLoad,
  loadItems,
} = useInfiniteScroll<EventLoadResult>({
  itemsPerPage: defaultLimit,
  loadFn: async (limit, offset) => {
    return loadLikedEvents(props.userId, authStore.user?.id, { limit, offset })
  },
})

onMounted(() => {
  loadItems()
})
</script>

<template>
  <div class="my-likes-tab">
    <div v-if="loading && events.length === 0" class="initial-loading">
      <q-spinner color="primary" size="50px" />
    </div>

    <q-infinite-scroll
      v-else-if="events.length > 0"
      :offset="250"
      class="events-scroll"
      :disable="loadingMore"
      @load="onLoad"
    >
      <div class="events-grid">
        <EventCard v-for="(event, index) in events" :key="event.eventId" v-model="events[index]!" />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyState
      v-else-if="!loading"
      empty-icon-name="favorite_border"
      :empty-text="t('noLikedEvents')"
    />
  </div>
</template>

<style lang="scss" scoped>
.my-likes-tab {
  @include flex-column;
  height: 100%;
}

.initial-loading {
  @include flex-center;
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

.loading-state {
  @include flex-center;
  flex: 1;
}
</style>
