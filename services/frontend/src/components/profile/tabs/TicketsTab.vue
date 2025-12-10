<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TicketCard from '@/components/cards/TicketCard.vue'
import EmptyTab from '@/components/profile/tabs/EmptyTab.vue'

const { t } = useI18n()

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
    <div v-if="myTickets.length > 0" class="tickets-list">
      <TicketCard
        v-for="ticket in myTickets"
        :key="ticket.id"
        :ticket="ticket"
        @download="handleDownload"
      />
    </div>

    <template v-else>
      <EmptyTab :emptyText="t('profile.noTickets')" emptyIconName="confirmation_number" />
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
