<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Event } from '@/api/types/events'
import EventDetailsHeader from './EventDetailsHeader.vue'
import EventInfo from './EventInfo.vue'
import OrganizationInfo from './OrganizationInfo.vue'
import EventReviewsPreview from './EventReviewsPreview.vue'
import { TICKET_PURCHASE_ROUTE_NAME } from '@/router'
import type { EventTicketType } from '@/api/types/payments'
import { useAuthStore } from '@/stores/auth'

interface Props {
  event: Event
  eventTickets: EventTicketType[]
  isAuthRequired: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isAuthRequired': [boolean]
}>()
const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const handleBuyTickets = () => {
  if (!authStore.user?.id) {
    emit('update:isAuthRequired', true)
    return
  }
  router.push({
    name: TICKET_PURCHASE_ROUTE_NAME,
    params: {
      id: props.event.eventId,
    },
  })
}

const ticketsAvailable = () => {
  return props.eventTickets.some((ticket) => !ticket.isSoldOut)
}
</script>

<template>
  <div class="content-wrapper">
    <div class="info-box">
      <EventDetailsHeader
        :event="event"
        :isAuthRequired="isAuthRequired"
        @update:is-auth-required="emit('update:isAuthRequired', $event)"
      />
      <EventInfo :event="event" :eventTickets="eventTickets" />
      <OrganizationInfo :event="event" />
      <template v-if="event.status === 'PUBLISHED'">
        <q-btn
          v-if="ticketsAvailable()"
          unelevated
          color="primary"
          :label="t('eventDetails.buyTickets')"
          :class="'full-width base-button base-button--primary'"
          size="lg"
          @click="handleBuyTickets"
        />
        <!-- TODO: show message when no tickets are available -->
        <div v-else class="sold-out-message full-width">Sold Out</div>
      </template>
      <EventReviewsPreview
        v-else-if="event.status === 'COMPLETED'"
        :eventId="event.eventId"
        :organizationId="event.creatorId"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.content-wrapper {
  flex: 1;
  max-width: $breakpoint-xl;
  margin: 0 auto;
  width: 100%;
  padding: 0 $spacing-4 $spacing-8;
  box-sizing: border-box;
}

.info-box {
  background: $color-background;
  border-radius: $radius-3xl;
  padding: $spacing-8;
  margin-top: -$spacing-12;
  position: relative;
  box-shadow: $shadow-lg;
  transition: all $transition-base;

  @include dark-mode {
    background: $color-background-dark;
  }
}

.sold-out-message {
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-gray-100;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  border-radius: $radius-lg;
  padding: $spacing-4 0;
  margin-top: $spacing-4;
  margin-bottom: $spacing-4;

  @include dark-mode {
    background: $color-background-dark-soft;
  }
}
</style>
