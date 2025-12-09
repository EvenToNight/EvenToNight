<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TicketCard from '@/components/cards/TicketCard.vue'

const { t } = useI18n()

// Mock data for tickets
const myTickets = ref([
  {
    id: '1',
    eventName: 'Techno vibes',
    eventImageLink: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    ticketNumber: '001234',
  },
  {
    id: '2',
    eventName: 'Summer Music Festival',
    eventImageLink: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    ticketNumber: '001235',
  },
])

const handleDownload = (ticketId: string) => {
  console.log('Downloading ticket:', ticketId)
}
</script>

<template>
  <div class="tickets-tab">
    <!-- Tickets List -->
    <div v-if="myTickets.length > 0" class="tickets-list">
      <TicketCard
        v-for="ticket in myTickets"
        :key="ticket.id"
        :ticket="ticket"
        @download="handleDownload"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <q-icon name="confirmation_number" size="64px" />
      <p class="empty-text">
        {{ t('profile.noTickets') }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tickets-tab {
  @include flex-column;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.empty-state {
  @include flex-column-center;
  padding: $spacing-12 $spacing-6;
  gap: $spacing-4;
}

.empty-text {
  font-size: $font-size-base;
  opacity: 0.6;
  margin: 0;
}
</style>
