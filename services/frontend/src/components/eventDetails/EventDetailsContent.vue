<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import type { Event } from '@/api/types/events'
import EventDetailsHeader from './EventDetailsHeader.vue'
import EventInfo from './EventInfo.vue'
import OrganizationInfo from './OrganizationInfo.vue'
import EventReviewsPreview from './EventReviewsPreview.vue'
import { TICKET_PURCHASE_ROUTE_NAME } from '@/router'
import type { EventTicketType } from '@/api/types/payments'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import { useTicketDownload } from '@/composables/useTicketDownload'

interface Props {
  event: Event
  eventTickets: EventTicketType[]
}
const props = defineProps<Props>()
const emit = defineEmits<{
  authRequired: [void]
}>()
const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { goToUserProfile } = useNavigation()
const { downloadTickets } = useTicketDownload()
const userHasTickets = ref(false)

onMounted(async () => {
  await checkUserHasTickets()
})

const checkUserHasTickets = async () => {
  if (!authStore.isAuthenticated) {
    userHasTickets.value = false
    return
  }

  try {
    userHasTickets.value = (
      await api.interactions.userParticipatedToEvent(authStore.user!.id, props.event.eventId)
    ).hasParticipated
  } catch (error) {
    console.error('Failed to check user tickets:', error)
    userHasTickets.value = false
  }
}

const handleBuyTickets = () => {
  if (!authStore.isAuthenticated) {
    emit('authRequired')
    return
  }
  router.push({
    name: TICKET_PURCHASE_ROUTE_NAME,
    params: {
      id: props.event.eventId,
    },
  })
}

const handleViewMyTickets = () => {
  if (!authStore.isAuthenticated) return
  goToUserProfile(authStore.user!.id)
  setTimeout(() => {
    window.location.hash = '#tickets'
  }, 100)
}

const ticketsAvailable = () => {
  return props.eventTickets.some((ticket) => !ticket.isSoldOut)
}
</script>

<template>
  <div class="content-wrapper">
    <div class="info-box">
      <EventDetailsHeader :event="event" @authRequired="emit('authRequired')" />
      <EventInfo :event="event" :eventTickets="eventTickets" />
      <OrganizationInfo :event="event" />
      <template v-if="event.status === 'PUBLISHED'">
        <!-- User already has tickets -->
        <div v-if="userHasTickets" class="ticket-actions">
          <q-btn
            unelevated
            color="primary"
            icon="download"
            label="Download Tickets"
            class="full-width base-button base-button--primary"
            size="lg"
            @click="downloadTickets(event)"
          />
          <q-btn
            outline
            color="primary"
            icon="confirmation_number"
            label="View My Tickets"
            class="full-width base-button"
            size="lg"
            @click="handleViewMyTickets"
          />
          <q-btn
            v-if="ticketsAvailable()"
            flat
            color="primary"
            label="Buy More Tickets"
            class="full-width"
            @click="handleBuyTickets"
          />
          <div v-else class="ticket-status-message full-width">Sold Out</div>
        </div>
        <!-- User doesn't have tickets yet -->
        <template v-else>
          <q-btn
            v-if="ticketsAvailable()"
            unelevated
            color="primary"
            :label="t('eventDetails.buyTickets')"
            :class="'full-width base-button base-button--primary'"
            size="lg"
            @click="handleBuyTickets"
          />
          <div v-else-if="eventTickets.length === 0" class="sold-out-message full-width">
            No Tickets Available
          </div>
          <div v-else class="sold-out-message full-width">Sold Out</div>
        </template>
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

.ticket-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  margin-top: $spacing-4;
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

.ticket-status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-primary;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  padding: $spacing-2;
  text-align: center;
  opacity: 0.6;
  cursor: default;
}
</style>
