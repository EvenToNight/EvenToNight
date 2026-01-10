<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/router/utils'
import { useQuasar } from 'quasar'
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'

const { params, goBack, push } = useNavigation()
const $q = useQuasar()

const reservationId = computed(() => params.reservationId as string)
const clientSecret = computed(
  () => new URLSearchParams(window.location.search).get('client_secret') || ''
)
const loading = ref(true)
const processing = ref(false)
const stripe = ref<Stripe | null>(null)
const elements = ref<StripeElements | null>(null)
const paymentElement = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  try {
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!stripePublishableKey) {
      throw new Error('Stripe publishable key not configured')
    }

    if (!clientSecret.value) {
      throw new Error('No client secret provided')
    }

    stripe.value = await loadStripe(stripePublishableKey)

    if (!stripe.value) {
      throw new Error('Failed to load Stripe')
    }

    elements.value = stripe.value.elements({
      clientSecret: clientSecret.value,
      appearance: {
        theme: 'stripe',
      },
    })

    const paymentElementInstance = elements.value.create('payment')
    paymentElementInstance.mount('#payment-element')

    loading.value = false
  } catch (error) {
    console.error('Failed to initialize Stripe:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to initialize payment',
      icon: 'error',
    })
    goBack()
  }
})

const handleSubmit = async () => {
  if (!stripe.value || !elements.value) {
    return
  }

  processing.value = true

  try {
    const { error } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    })

    if (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Payment failed',
        icon: 'error',
      })
    }
  } catch (error) {
    console.error('Payment error:', error)
    $q.notify({
      type: 'negative',
      message: 'An error occurred during payment',
      icon: 'error',
    })
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <NavigationButtons />

  <div class="checkout-view">
    <div class="checkout-container">
      <q-inner-loading :showing="loading" />

      <div v-if="!loading" class="checkout-card">
        <div class="card-header">
          <h1 class="page-title">Complete Your Purchase</h1>
        </div>

        <div class="card-body">
          <div id="payment-element" class="payment-element"></div>
        </div>

        <div class="card-actions">
          <q-btn flat label="Cancel" color="grey-7" :disable="processing" @click="goBack" />
          <q-btn
            unelevated
            label="Pay Now"
            color="primary"
            :loading="processing"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkout-view {
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

.checkout-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 $spacing-6 $spacing-8;
  position: relative;
  min-height: 400px;

  @media (max-width: $breakpoint-mobile) {
    padding: 0 $spacing-4 $spacing-6;
  }
}

.checkout-card {
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

.payment-element {
  margin-bottom: $spacing-4;
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

    .q-btn {
      width: 100%;
    }
  }
}
</style>
