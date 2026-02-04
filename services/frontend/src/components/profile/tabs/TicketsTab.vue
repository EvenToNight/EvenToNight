<script setup lang="ts">
import { onMounted, computed } from 'vue'
import TicketCard from '@/components/cards/TicketCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import type { Event } from '@/api/types/events'
import { loadUserEventParticipations } from '@/api/utils/paymentsUtils'
import { useTranslation } from '@/composables/useTranslation'

const ITEMS_PER_PAGE = 20

const { t } = useTranslation('components.profile.tabs.TicketsTab')
const authStore = useAuthStore()

const userId = computed(() => authStore.user!.id)

const {
  items: events,
  loading,
  loadingMore,
  onLoad,
  loadItems,
} = useInfiniteScroll<Event>({
  itemsPerPage: ITEMS_PER_PAGE,
  loadFn: async (limit, offset) => {
    return loadUserEventParticipations(
      userId.value,
      { limit, offset },
      {
        eventStatus: 'PUBLISHED',
        sortOrder: 'asc',
      }
    )
  },
})

onMounted(() => {
  loadItems()
})
</script>

<template>
  <div class="tickets-tab">
    <div v-if="loading && events.length === 0" class="initial-loading">
      <q-spinner color="primary" size="50px" />
    </div>

    <q-infinite-scroll
      v-else-if="events.length > 0"
      :offset="250"
      class="tickets-scroll"
      :disable="loadingMore"
      @load="onLoad"
    >
      <div class="tickets-list">
        <TicketCard v-for="event in events" :key="event.eventId" :event="event" />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyState
      v-else-if="!loading"
      empty-icon-name="confirmation_number"
      :empty-text="t('noTickets')"
    />
  </div>
</template>

<style lang="scss" scoped>
.tickets-tab {
  @include flex-column;
  height: 100%;
}

.initial-loading {
  @include flex-center;
}

.tickets-scroll {
  height: 100%;
}

.tickets-list {
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-3;
}

.loading-state {
  @include flex-center;
  flex: 1;
}
</style>
