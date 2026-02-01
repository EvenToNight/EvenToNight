<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useTicketDownload } from '@/composables/useTicketDownload'
import { useNavigation } from '@/router/utils'
import type { EventTicketType } from '@/api/types/payments'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

interface Props {
  event: Event
  eventTickets: EventTicketType[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  authRequired: [void]
}>()
const authStore = useAuthStore()
const { t } = useTranslation('components.eventDetails.EventDetailsActions')
const logger = createLogger(import.meta.url)
const { goToUserProfile, goToPurchaseTickets } = useNavigation()
const { downloadTickets } = useTicketDownload()

const userHasTickets = ref(false)

const checkUserHasTickets = async () => {
  if (!authStore.user) {
    userHasTickets.value = false
    return
  }

  try {
    userHasTickets.value = (
      await api.interactions.userParticipatedToEvent(authStore.user.id, props.event.eventId)
    ).hasParticipated
  } catch (error) {
    logger.error('Failed to check user tickets:', error)
    userHasTickets.value = false
  }
}

const ticketsAvailable = () => {
  return props.eventTickets.some((ticket) => !ticket.isSoldOut)
}

const handleBuyTickets = () => {
  if (!authStore.isAuthenticated) {
    emit('authRequired')
    return
  }
  goToPurchaseTickets(props.event.eventId)
}
onMounted(() => {
  checkUserHasTickets()
})
</script>
<template>
  <div>
    <div v-if="authStore.user && userHasTickets" class="column q-gutter-y-sm q-mt-md">
      <q-btn
        unelevated
        color="primary"
        icon="download"
        :label="t('downloadTickets')"
        class="full-width base-button base-button--primary"
        size="lg"
        @click="downloadTickets(event)"
      />
      <q-btn
        outline
        color="primary"
        icon="confirmation_number"
        :label="t('viewMyTickets')"
        class="full-width base-button"
        size="lg"
        @click="goToUserProfile(authStore.user.id, 'tickets')"
      />
      <q-btn
        v-if="ticketsAvailable()"
        flat
        color="primary"
        :label="t('buyMoreTickets')"
        class="full-width"
        @click="handleBuyTickets"
      />
      <div v-else class="ticket-status-message text-center full-width q-pa-sm">
        {{ t('soldOut') }}
      </div>
    </div>
    <template v-else>
      <q-btn
        v-if="ticketsAvailable()"
        unelevated
        color="primary"
        :label="t('buyTickets')"
        class="full-width base-button base-button--primary"
        size="lg"
        @click="handleBuyTickets"
      />
      <div v-else-if="eventTickets.length === 0" class="sold-out-message text-center full-width">
        {{ t('noTicketsAvailable') }}
      </div>
      <div v-else class="sold-out-message text-center full-width">{{ t('soldOut') }}</div>
    </template>
  </div>
</template>
<style scoped lang="scss">
.sold-out-message {
  @include flex-center;
  background: $color-gray-100;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  border-radius: $radius-lg;
  padding: $spacing-4 0;
  margin: $spacing-4 0;

  @include dark-mode {
    background: $color-background-dark-soft;
  }
}

.ticket-status-message {
  color: $color-primary;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  opacity: 0.6;
  cursor: default;
}
</style>
