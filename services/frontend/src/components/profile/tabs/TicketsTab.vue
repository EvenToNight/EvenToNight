<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TicketCard from '@/components/cards/TicketCard.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const myTickets = ref([
  {
    id: '1',
    eventId: 'evt_1',
    eventName: 'Techno vibes',
    eventImageLink: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    ticketNumber: '001234',
  },
  {
    id: '2',
    eventId: 'evt_2',
    eventName: 'Summer Music Festival',
    eventImageLink: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    ticketNumber: '001235',
  },
])

const handleDownload = async (ticketId: string) => {
  const ticket = myTickets.value.find((t) => t.id === ticketId)
  if (!ticket) {
    console.error('Ticket not found')
    return
  }

  const userId = authStore.user?.id
  if (!userId) {
    console.error('User not logged in')
    return
  }

  try {
    const blob = await api.payments.getEventPdfTickets(userId, ticket.eventId)

    // Create a download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tickets-${ticket.eventName.replace(/\s+/g, '-')}.pdf`
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading ticket PDF:', error)
  }
}
</script>

<template>
  <div class="tickets-tab">
    <div v-if="myTickets.length > 0" class="tickets-list">
      <TicketCard
        v-for="ticket in myTickets"
        :key="ticket.id"
        :ticket="ticket"
        @download="handleDownload"
      />
    </div>

    <template v-else>
      <EmptyTab :emptyText="t('userProfile.noTickets')" emptyIconName="confirmation_number" />
    </template>
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
