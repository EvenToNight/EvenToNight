<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import { FORBIDDEN_ROUTE_NAME } from '@/router'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { createLogger } from '@/utils/logger'
import { useTranslation } from '@/composables/useTranslation'

const logger = createLogger(import.meta.url)
const { t } = useTranslation('views.VerifyTicketView')

const { params, goToRoute } = useNavigation()
const ticketId = ref<string>(params.ticketId as string)
const loading = ref(true)
const error = ref(false)
const wasAlreadyUsed = ref(false)

const verifyTicket = async () => {
  loading.value = true
  error.value = false

  try {
    const result = await api.payments.verifyTicket(ticketId.value)

    if (result) {
      wasAlreadyUsed.value = false
    } else {
      wasAlreadyUsed.value = true
    }
  } catch (error: any) {
    logger.error('Ticket verification failed:', error)
    if (error.status === 403) {
      goToRoute(FORBIDDEN_ROUTE_NAME)
    } else {
      error.value = true
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  verifyTicket()
})
</script>

<template>
  <NavigationButtons />

  <div class="verify-ticket-page">
    <div class="verify-container">
      <div v-if="loading" class="verify-state loading-state">
        <q-spinner color="primary" size="60px" />
        <h1 class="verify-title">{{ t('loadingTitle') }}</h1>
        <p class="verify-message">{{ t('loadingMessage') }}</p>
      </div>

      <div v-else-if="error" class="verify-state error-state">
        <q-icon name="error" size="80px" color="negative" />
        <h1 class="verify-title">{{ t('failedTitle') }}</h1>
        <p class="verify-message">{{ t('failedMessage') }}</p>
        <q-btn
          label="Try Again"
          color="primary"
          size="lg"
          class="action-btn"
          @click="verifyTicket"
        />
      </div>

      <div v-else-if="wasAlreadyUsed" class="verify-state already-used-state">
        <q-icon name="block" size="80px" color="negative" />
        <h1 class="verify-title">{{ t('alreadyUsedTitle') }}</h1>
        <p class="verify-message">{{ t('alreadyUsedMessage') }}</p>
        <div class="ticket-info">
          <p class="ticket-id">{{ t('ticketID') }}: {{ ticketId }}</p>
        </div>
      </div>

      <div v-else class="verify-state success-state">
        <q-icon name="check_circle" size="80px" color="positive" />
        <h1 class="verify-title">{{ t('successTitle') }}</h1>
        <p class="verify-message">{{ t('successMessage') }}</p>
        <div class="ticket-info">
          <p class="ticket-id">{{ t('ticketID') }}: {{ ticketId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.verify-ticket-page {
  min-height: calc(100vh - 200px);
  padding: $spacing-8;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.verify-container {
  max-width: 600px;
  width: 100%;
}

.verify-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: $spacing-8;
  border-radius: $radius-xl;

  @include light-mode {
    background-color: $color-white;
    box-shadow: $shadow-lg;
  }

  @include dark-mode {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-6;
  }
}

.verify-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  margin: $spacing-4 0 $spacing-3 0;

  @include light-mode {
    color: $color-text-primary;
  }

  @include dark-mode {
    color: $color-white;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-2xl;
  }
}

.verify-message {
  font-size: $font-size-lg;
  line-height: 1.6;
  margin-bottom: $spacing-4;

  @include light-mode {
    color: $color-text-secondary;
  }

  @include dark-mode {
    color: rgba($color-white, 0.7);
  }
}

.ticket-info {
  margin-top: $spacing-6;
  padding: $spacing-4;
  border-radius: $radius-lg;
  width: 100%;

  @include light-mode {
    background-color: $color-background;
  }

  @include dark-mode {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .ticket-id {
    font-size: $font-size-base;
    font-family: monospace;
    margin: 0;

    @include light-mode {
      color: $color-text-primary;
    }

    @include dark-mode {
      color: $color-white;
    }
  }
}

.action-btn {
  margin-top: $spacing-4;
}

.success-state {
  .q-icon {
    animation: scaleIn 0.5s ease-out;
  }
}

.already-used-state {
  .q-icon {
    animation: shake 0.5s ease-out;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}
</style>
