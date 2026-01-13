<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useQuasar } from 'quasar'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'

const { params, goBack } = useNavigation()
const $q = useQuasar()

const eventId = computed(() => params.id as string)
const event = ref<Event | null>(null)
const ticketQuantity = ref(1)
const loading = ref(false)
const purchasing = ref(false)

const totalPrice = computed(() => {
  if (!event.value) return 0
  return event.value.price * ticketQuantity.value
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
    event.value = await api.events.getEventById(eventId.value)
    const ticketsAvailable = await api.payments.getEventTicketType(eventId.value)
    console.log('Tickets available:', ticketsAvailable)
  } catch (error) {
    console.error('Failed to load event:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load event',
    })
    goBack()
  } finally {
    loading.value = false
  }
})

const handlePurchase = async () => {
  purchasing.value = true
  try {
    // TODO: Implement ticket purchase API
    // await api.tickets.purchaseTickets(eventId.value, ticketQuantity.value)

    $q.notify({
      type: 'positive',
      message: `Successfully purchased ${ticketQuantity.value} ticket${ticketQuantity.value > 1 ? 's' : ''}!`,
      icon: 'check_circle',
    })

    // Navigate back after purchase
    setTimeout(() => {
      goBack()
    }, 1000)
  } catch (error) {
    console.error('Failed to purchase tickets:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to purchase tickets',
      icon: 'error',
    })
  } finally {
    purchasing.value = false
  }
}

const incrementQuantity = () => {
  ticketQuantity.value++
}

const decrementQuantity = () => {
  if (ticketQuantity.value > 1) {
    ticketQuantity.value--
  }
}
</script>

<template>
  <NavigationButtons />

  <div class="ticket-purchase-view">
    <div class="ticket-purchase-container">
      <q-inner-loading :showing="loading" />

      <div v-if="!loading && event" class="purchase-card">
        <div class="card-header">
          <h1 class="page-title">Purchase Tickets</h1>
        </div>

        <div class="card-body">
          <!-- Event Info Summary -->
          <div class="event-summary">
            <div class="event-poster-container">
              <img :src="event.poster" :alt="event.title" class="event-poster" />
            </div>

            <div class="event-details">
              <h2 class="event-title">{{ event.title }}</h2>

              <div class="event-info-row">
                <q-icon name="event" size="20px" />
                <span>{{ new Date(event.date).toLocaleDateString() }}</span>
              </div>

              <div class="event-info-row">
                <q-icon name="location_on" size="20px" />
                <span>{{ locationAddress }}</span>
              </div>

              <div class="event-info-row">
                <q-icon name="euro" size="20px" />
                <span>{{ event.price.toFixed(2) }} per ticket</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Ticket Quantity Selector -->
          <div class="quantity-section">
            <h3 class="section-title">Number of Tickets</h3>

            <div class="quantity-selector">
              <q-btn
                round
                flat
                icon="remove"
                color="primary"
                :disable="ticketQuantity <= 1"
                @click="decrementQuantity"
              />

              <div class="quantity-display">
                <span class="quantity-number">{{ ticketQuantity }}</span>
                <span class="quantity-label">Ticket{{ ticketQuantity > 1 ? 's' : '' }}</span>
              </div>

              <q-btn round flat icon="add" color="primary" @click="incrementQuantity" />
            </div>
          </div>

          <div class="divider"></div>

          <!-- Total Price -->
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Total</span>
              <span class="total-price">€{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <Button :label="'Cancel'" variant="secondary" @click="goBack" />
          <Button
            :label="'Purchase'"
            variant="primary"
            :loading="purchasing"
            @click="handlePurchase"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ticket-purchase-view {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  margin-top: calc(-1 * v-bind(NAVBAR_HEIGHT_CSS));
  padding-top: calc(v-bind(NAVBAR_HEIGHT_CSS) + #{$spacing-6});

  @include dark-mode {
    background: #121212;
  }

  @media (max-width: $breakpoint-mobile) {
    padding-top: calc(v-bind(NAVBAR_HEIGHT_CSS) + #{$spacing-4});
  }
}

.ticket-purchase-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 $spacing-6 $spacing-8;
  position: relative;
  min-height: 400px;

  @media (max-width: $breakpoint-mobile) {
    padding: 0 $spacing-4 $spacing-6;
  }
}

.purchase-card {
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-base;
  overflow: hidden;

  @include dark-mode {
    background: $color-background-dark;
  }
}

.card-header {
  padding: $spacing-6;
  border-bottom: 1px solid $color-gray-200;

  @include dark-mode {
    border-bottom-color: rgba($color-white, 0.1);
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.page-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  line-height: 1.2;
  margin: 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-2xl;
  }
}

.card-body {
  padding: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.event-summary {
  display: flex;
  gap: $spacing-5;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
  }
}

.event-poster-container {
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;

  @media (max-width: $breakpoint-mobile) {
    width: 100%;
    height: 250px;
  }
}

.event-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.event-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  margin: 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-xl;
  }
}

.event-info-row {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-base;
  color: $color-gray-700;

  @include dark-mode {
    color: $color-gray-300;
  }

  .q-icon {
    color: $color-primary;
  }
}

.divider {
  height: 1px;
  background: $color-gray-200;
  margin: $spacing-6 0;

  @include dark-mode {
    background: rgba($color-white, 0.1);
  }
}

.quantity-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.section-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-6;
}

.quantity-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.quantity-number {
  font-size: 3rem;
  font-weight: $font-weight-bold;
  color: $color-primary;
  line-height: 1;
}

.quantity-label {
  font-size: $font-size-sm;
  color: $color-gray-600;
  margin-top: $spacing-2;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.total-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.total-price {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-3;
  padding: $spacing-4 $spacing-6;
  border-top: 1px solid $color-gray-200;

  @include dark-mode {
    border-top-color: rgba($color-white, 0.1);
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-3 $spacing-4;
    flex-direction: column-reverse;

    :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
