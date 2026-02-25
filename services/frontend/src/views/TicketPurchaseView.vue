<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import type { EventTicketType } from '@/api/types/payments'
import { useQuasar } from 'quasar'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'
import { useAuthStore } from '@/stores/auth'
import { preventInvalidNumberKeys } from '@/utils/inputUtils'
import { createLogger } from '@/utils/logger'
import { SERVER_ERROR_ROUTE_NAME } from '@/router'
import { useTranslation } from '@/composables/useTranslation'

const logger = createLogger(import.meta.url)
const { t } = useTranslation('views.TicketPurchaseView')
const { params, goBack, goToRoute } = useNavigation()
const $q = useQuasar()
const authStore = useAuthStore()

const eventId = computed(() => params.id as string)
const event = ref<Event | null>(null)
const loading = ref(false)
const purchasing = ref(false)
const ticketTypes = ref<EventTicketType[]>([])
const ticketQuantities = ref<Record<string, number>>({})

const getAvailableQuantity = (tt: EventTicketType) => {
  return tt.availableQuantity
}

const getQuantity = (ttId: string) => {
  return ticketQuantities.value[ttId] || 0
}

const incrementQuantity = (tt: EventTicketType) => {
  const current = getQuantity(tt.id)
  const max = tt.availableQuantity
  if (current < max) {
    ticketQuantities.value[tt.id] = current + 1
  }
}

const decrementQuantity = (tt: EventTicketType) => {
  const current = getQuantity(tt.id)
  if (current > 0) {
    ticketQuantities.value[tt.id] = current - 1
  }
}

const handleQuantityChange = (tt: EventTicketType, quantity: string) => {
  const numValue = parseInt(quantity) || 0
  const clampedValue = Math.max(0, Math.min(numValue, tt.availableQuantity))

  if (clampedValue === 0) {
    delete ticketQuantities.value[tt.id]
  } else {
    ticketQuantities.value[tt.id] = clampedValue
  }
}

const hasAnyTickets = computed(() => {
  return Object.values(ticketQuantities.value).some((q) => q > 0)
})

const totalPrice = computed(() => {
  let total = 0
  for (const tt of ticketTypes.value) {
    const qty = getQuantity(tt.id)
    if (qty > 0) {
      total += tt.price * qty
    }
  }
  return total
})

const selectedTickets = computed(() => {
  return ticketTypes.value
    .filter((tt) => getQuantity(tt.id) > 0)
    .map((tt) => ({
      ticketType: tt,
      quantity: getQuantity(tt.id),
    }))
})

const totalTicketCount = computed(() => {
  return Object.values(ticketQuantities.value).reduce((sum, q) => sum + q, 0)
})

const locationAddress = computed(() => {
  if (!event.value) return ''
  const loc = event.value.location
  return [loc.name, loc.road, loc.house_number, loc.city, loc.province, loc.country]
    .filter(Boolean)
    .join(', ')
})

onMounted(async () => {
  try {
    loading.value = true
    const [eventData, ticketsAvailable] = await Promise.all([
      api.events.getEventById(eventId.value),
      api.payments.getEventTicketsType(eventId.value),
    ])
    event.value = eventData
    ticketTypes.value = ticketsAvailable
  } catch (error) {
    logger.error('Failed to load event:', error)
    $q.notify({
      type: 'negative',
      message: t('messages.errors.load'),
    })
    goToRoute(SERVER_ERROR_ROUTE_NAME)
  } finally {
    loading.value = false
  }
})

const handlePurchase = async () => {
  if (!authStore.user || !hasAnyTickets.value) {
    $q.notify({
      type: 'negative',
      message: t('messages.errors.noTicketsSelected'),
    })
    return
  }

  purchasing.value = true
  try {
    const items: { ticketTypeId: string; attendeeName: string }[] = []
    for (const { ticketType, quantity } of selectedTickets.value) {
      for (let i = 0; i < quantity; i++) {
        items.push({
          ticketTypeId: ticketType.id,
          attendeeName: authStore.user!.name,
        })
      }
    }

    const session = await api.payments.createCheckoutSession({
      userId: authStore.user.id,
      items,
      successUrl: window.location.href.replace('/purchase', ''),
      cancelUrl: window.location.href,
    })

    window.location.href = session.redirectUrl
  } catch (error) {
    logger.error('Failed to create checkout session:', error)
    $q.notify({
      type: 'negative',
      message: t('messages.errors.createCheckoutSession'),
    })
    purchasing.value = false
  }
}
</script>

<template>
  <NavigationButtons />

  <div class="ticket-purchase-view">
    <div class="ticket-purchase-container">
      <q-inner-loading :showing="loading" />

      <div v-if="!loading && event" class="purchase-layout">
        <!-- Left: Event Info -->
        <div class="event-card">
          <div class="event-poster-container">
            <img :src="event.poster" :alt="event.title" class="event-poster" />
          </div>
          <div class="event-info">
            <h2 class="event-title">{{ event.title }}</h2>
            <div class="event-meta">
              <div class="meta-item">
                <q-icon name="event" size="18px" />
                <span>{{ new Date(event.date).toLocaleDateString() }}</span>
              </div>
              <div class="meta-item">
                <q-icon name="schedule" size="18px" />
                <span>{{
                  new Date(event.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}</span>
              </div>
              <div class="meta-item">
                <q-icon name="location_on" size="18px" />
                <span>{{ locationAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="selection-card">
          <h1 class="card-title">{{ t('ticketSelection.title') }}</h1>

          <div class="ticket-types-list">
            <div
              v-for="tt in ticketTypes"
              :key="tt.id"
              class="ticket-type-card"
              :class="{
                'has-quantity': getQuantity(tt.id) > 0,
                'sold-out': tt.isSoldOut,
              }"
            >
              <div class="ticket-type-main">
                <div class="ticket-type-info">
                  <div class="ticket-type-name">{{ tt.type }}</div>
                  <div class="ticket-type-availability">
                    <span v-if="tt.availableQuantity > 0">
                      {{ tt.availableQuantity }} {{ t('ticketSelection.available') }}
                    </span>
                    <span v-else class="sold-out-text">{{ t('ticketSelection.soldOut') }}</span>
                  </div>
                </div>
                <div class="ticket-type-price">
                  {{ tt.price.toFixed(2) }}
                  <span class="currency">$</span>
                </div>
              </div>

              <!-- Quantity Controls -->
              <div v-if="getAvailableQuantity(tt) > 0" class="quantity-controls">
                <q-btn
                  round
                  flat
                  dense
                  icon="remove"
                  :disable="getQuantity(tt.id) <= 0"
                  class="qty-btn"
                  @click="decrementQuantity(tt)"
                />
                <input
                  type="number"
                  :value="getQuantity(tt.id)"
                  :aria-label="t('ticketSelection.quantityAriaLabel') + ' ' + tt.type"
                  class="quantity-input"
                  @keydown="preventInvalidNumberKeys"
                  @blur="(e) => handleQuantityChange(tt, (e.target as HTMLInputElement).value)"
                />
                <q-btn
                  round
                  flat
                  dense
                  icon="add"
                  :disable="getQuantity(tt.id) >= getAvailableQuantity(tt)"
                  class="qty-btn"
                  @click="incrementQuantity(tt)"
                />
              </div>
            </div>
          </div>

          <div v-if="hasAnyTickets" class="summary-section">
            <div v-for="item in selectedTickets" :key="item.ticketType.id" class="summary-row">
              <span>{{ item.ticketType.type }} x {{ item.quantity }}</span>
              <span>{{ (item.ticketType.price * item.quantity).toFixed(2) }} $</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span
                >{{ t('ticketSelection.total') }} ({{ totalTicketCount }}
                {{
                  totalTicketCount > 1 ? t('ticketSelection.tickets') : t('ticketSelection.ticket')
                }})</span
              >
              <span class="total-amount">{{ totalPrice.toFixed(2) }} $</span>
            </div>
          </div>

          <div class="actions-section">
            <q-btn
              flat
              :label="t('ticketSelection.actions.cancel')"
              class="cancel-btn base-button base-button--tertiary"
              @click="goBack"
            />
            <q-btn
              unelevated
              color="primary"
              :label="t('ticketSelection.actions.continueToPayment')"
              :loading="purchasing"
              :disable="!hasAnyTickets"
              class="purchase-btn base-button base-button--primary"
              @click="handlePurchase"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ticket-purchase-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  margin-top: calc(-1 * v-bind(NAVBAR_HEIGHT_CSS));
  padding-top: calc(v-bind(NAVBAR_HEIGHT_CSS) + #{$spacing-6});
  padding-bottom: $spacing-8;

  @include dark-mode {
    background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  }
}

.ticket-purchase-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 $spacing-4;
  position: relative;
  min-height: 400px;
}

.purchase-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: $spacing-6;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.event-card {
  background: $color-white;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: calc(v-bind(NAVBAR_HEIGHT_CSS) + #{$spacing-4});

  @include dark-mode {
    background: #1e1e1e;
  }

  @media (max-width: 768px) {
    position: static;
  }
}

.event-poster-container {
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.event-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-info {
  padding: $spacing-5;
}

.event-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  margin: 0 0 $spacing-4;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  color: $color-gray-600;

  @include dark-mode {
    color: $color-gray-400;
  }

  .q-icon {
    color: $color-primary;
  }
}

.selection-card {
  background: $color-white;
  border-radius: $radius-xl;
  padding: $spacing-6;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);

  @include dark-mode {
    background: #1e1e1e;
  }

  @media (max-width: 768px) {
    padding: $spacing-4;
  }
}

.card-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  margin: 0 0 $spacing-5;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.ticket-types-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  margin-bottom: $spacing-5;
}

.ticket-type-card {
  border: 2px solid $color-gray-200;
  border-radius: $radius-lg;
  padding: $spacing-4;
  transition: all 0.2s ease;

  @include dark-mode {
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.has-quantity {
    border-color: $color-primary;
    background: rgba($color-primary, 0.05);

    @include dark-mode {
      background: rgba($color-primary, 0.15);
    }
  }

  &.sold-out {
    opacity: 0.5;
  }
}

.ticket-type-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-3;
}

.ticket-type-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.ticket-type-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.ticket-type-availability {
  font-size: $font-size-sm;
  color: $color-gray-500;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.sold-out-text {
  color: $color-error;
  font-weight: $font-weight-medium;
}

.ticket-type-price {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-primary;

  .currency {
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
  }
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-4;
  padding-top: $spacing-3;
  border-top: 1px solid $color-gray-100;

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}

.qty-btn {
  background: $color-gray-100;
  width: 36px;
  height: 36px;

  @include dark-mode {
    background: #2a2a2a;
  }

  &:hover:not(:disabled) {
    background: $color-gray-200;

    @include dark-mode {
      background: #3a3a3a;
    }
  }

  &:disabled {
    opacity: 0.4;
  }
}

.quantity-input {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  width: 60px;
  text-align: center;
  color: $color-text-primary;
  background: $color-white;
  border: 1px solid $color-gray-200;
  border-radius: $radius-sm;
  padding: $spacing-1 $spacing-2;
  transition: all 0.2s ease;

  @include dark-mode {
    color: $color-text-dark;
    background: #1a1a1a;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
  }

  // Hide arrows for number input
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
}

.summary-section {
  padding: $spacing-4;
  background: $color-gray-50;
  border-radius: $radius-md;
  margin-bottom: $spacing-5;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: $font-size-base;
  color: $color-gray-600;
  padding: $spacing-1 0;

  @include dark-mode {
    color: $color-gray-400;
  }

  &.total {
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    padding-top: $spacing-2;

    @include dark-mode {
      color: $color-text-dark;
    }
  }
}

.summary-divider {
  height: 1px;
  background: $color-gray-200;
  margin: $spacing-3 0;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.1);
  }
}

.total-amount {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.actions-section {
  display: flex;
  gap: $spacing-3;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
}

.cancel-btn {
  flex: 0 0 auto;
}

.purchase-btn {
  flex: 1;
}
</style>
