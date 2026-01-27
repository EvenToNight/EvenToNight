<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
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
const $q = useQuasar()
const { goToUserProfile } = useNavigation()
const userHasTickets = ref(false)

onMounted(async () => {
  await checkUserHasTickets()
})

const checkUserHasTickets = async () => {
  if (!authStore.user?.id) {
    userHasTickets.value = false
    return
  }

  try {
    userHasTickets.value = (
      await api.interactions.userParticipatedToEvent(authStore.user.id, props.event.eventId)
    ).hasParticipated
  } catch (error) {
    console.error('Failed to check user tickets:', error)
    userHasTickets.value = false
  }
}

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

const handleDownloadTickets = async () => {
  if (!authStore.user?.id) return

  try {
    const blob = await api.payments.getEventPdfTickets(authStore.user.id, props.event.eventId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickets-${props.event.title}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Tickets downloaded successfully',
      icon: 'download',
    })
  } catch (error) {
    console.error('Failed to download tickets:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to download tickets',
      icon: 'error',
    })
  }
}

const handleViewMyTickets = () => {
  if (!authStore.user?.id) return
  goToUserProfile(authStore.user.id)
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
      <EventDetailsHeader
        :event="event"
        :isAuthRequired="isAuthRequired"
        @update:is-auth-required="emit('update:isAuthRequired', $event)"
      />
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
            @click="handleDownloadTickets"
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
