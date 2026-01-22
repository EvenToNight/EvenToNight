<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TicketCard from '@/components/cards/TicketCard.vue'
import InfiniteScrollList from '@/components/common/InfiniteScrollList.vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { PaginatedResponse } from '@/api/interfaces/commons'
import type { Event } from '@/api/types/events'

const { t } = useI18n()
const authStore = useAuthStore()

const events = ref<Event[]>([])

const userId = computed(() => authStore.user?.id)

const loadItems = async (offset: number, limit: number): Promise<PaginatedResponse<Event>> => {
  if (!userId.value) {
    return {
      items: [],
      limit,
      offset,
      hasMore: false,
    }
  }

  const response = await api.payments.findEventsWithUserTickets(userId.value, { offset, limit })

  if (response.items.length > 0) {
    const eventsData = await api.events.getEventsByIds(response.items)
    return {
      items: eventsData.events,
      limit: response.limit,
      offset: response.offset,
      hasMore: response.hasMore,
    }
  }

  return {
    items: [],
    limit: response.limit,
    offset: response.offset,
    hasMore: response.hasMore,
  }
}

const handleDownload = async (eventId: string) => {
  if (!userId.value) {
    console.error('User not logged in')
    return
  }

  const event = events.value.find((e) => e.eventId === eventId)
  if (!event) {
    console.error('Event not found')
    return
  }

  try {
    const blob = await api.payments.getEventPdfTickets(userId.value, eventId)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tickets-${event.title.replace(/\s+/g, '-')}.pdf`
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading ticket PDF:', error)
  }
}
</script>

<template>
  <div class="tickets-tab">
    <InfiniteScrollList
      v-model="events"
      :load-items="loadItems"
      :empty-text="t('userProfile.noTickets')"
      empty-icon-name="confirmation_number"
    >
      <template #default>
        <div class="tickets-list">
          <TicketCard
            v-for="event in events"
            :key="event.eventId"
            :event="event"
            @download="handleDownload"
          />
        </div>
      </template>
    </InfiniteScrollList>
  </div>
</template>

<style lang="scss" scoped>
.tickets-tab {
  @include flex-column;
}

.tickets-list {
  @include flex-column;
  gap: $spacing-4;
}
</style>
