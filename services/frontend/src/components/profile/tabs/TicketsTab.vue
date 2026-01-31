<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TicketCard from '@/components/cards/TicketCard.vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import type { Event } from '@/api/types/events'
import { loadUserEventParticipations } from '@/api/utils/paymentsUtils'

const ITEMS_PER_PAGE = 20

const { t } = useI18n()
const authStore = useAuthStore()

const userId = computed(() => authStore.user!.id)

const {
  items: events,
  loading,
  loadingMore,
  onLoad,
  loadItems,
} = useInfiniteScroll<{ userId: string }, Event>({
  itemsPerPage: ITEMS_PER_PAGE,
  options: { userId: userId.value },
  loadFn: async (limit, offset, options) => {
    return loadUserEventParticipations(
      options!.userId,
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
    <q-infinite-scroll
      v-if="!loading && events.length > 0"
      :offset="250"
      class="tickets-scroll"
      :disable="loadingMore"
      @load="onLoad"
    >
      <div class="tickets-list">
        <TicketCard v-for="event in events" :key="event.eventId" :event="event" />
      </div>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyState
      v-else-if="!loading"
      empty-icon-name="confirmation_number"
      :empty-text="t('userProfile.noTickets')"
    />
  </div>
</template>

<style lang="scss" scoped>
.tickets-tab {
  @include flex-column;
  height: 100%;
}

.tickets-scroll {
  height: 100%;
}

.tickets-list {
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-3;
}
</style>
