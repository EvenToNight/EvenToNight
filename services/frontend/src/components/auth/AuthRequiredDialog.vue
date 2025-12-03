<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { watch } from 'vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const router = useRouter()

const close = () => {
  emit('update:modelValue', false)
}

const goToLogin = () => {
  close()
  router.push({ name: 'login' })
}

const goToRegister = () => {
  close()
  router.push({ name: 'register' })
}

// Lock/unlock scroll quando il dialog si apre/chiude
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      // Salva la posizione di scroll corrente
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      // Blocca solo scroll verticale
      document.body.style.overflowY = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = `-${scrollX}px`
      document.body.style.right = '0'
      document.body.style.width = '100%'
    } else {
      // Ripristina la posizione di scroll
      const scrollY = parseInt(document.body.style.top || '0') * -1
      const scrollX = parseInt(document.body.style.left || '0') * -1

      document.body.style.overflowY = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''

      window.scrollTo(scrollX, scrollY)
    }
  }
)
</script>

<template>
  <Transition name="dialog">
    <div v-if="modelValue" class="dialog-overlay" @click="close">
      <q-card class="auth-required-dialog" @click.stop>
        <q-btn flat dense round icon="close" class="close-button" @click="close" />

        <q-card-section class="dialog-header">
          <div class="dialog-icon">
            <q-icon name="lock" size="48px" />
          </div>
          <h2 class="dialog-title">{{ t('auth.notLoggedIn') }}</h2>
          <p class="dialog-message">{{ t('auth.loginRequired') }}</p>
        </q-card-section>

        <q-card-actions class="dialog-actions">
          <q-btn
            unelevated
            color="primary"
            :label="t('nav.login')"
            class="action-button"
            @click="goToLogin"
          />
          <q-btn flat :label="t('nav.register')" class="action-button" @click="goToRegister" />
        </q-card-actions>
      </q-card>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    // Su mobile diventa absolute per essere solidale all'app
    position: absolute;
    // Si estende per tutta la larghezza dell'app
    left: 0;
    right: 0;
    // Ma rimane fixed verticalmente
    top: 0;
    height: 100vh;
    bottom: auto;
  }
}

.auth-required-dialog {
  min-width: 280px;
  max-width: 400px;
  border-radius: 16px;
  padding: $spacing-4;
  position: relative;

  @media (max-width: 768px) {
    margin: $spacing-4;
  }
}

.close-button {
  position: absolute;
  top: $spacing-2;
  right: $spacing-2;
  z-index: 10;
  opacity: 0.6;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.dialog-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: $spacing-6 $spacing-4 $spacing-4;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  margin-bottom: $spacing-4;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 $spacing-2 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.dialog-message {
  font-size: 1rem;
  margin: 0;
  opacity: 0.7;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.dialog-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  padding: $spacing-4;
}

.action-button {
  width: 100%;
  padding: $spacing-3;
  font-size: 1rem;
  font-weight: 600;
}

// Animazioni per il dialog
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;

  .auth-required-dialog {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;

  .auth-required-dialog {
    transform: scale(0.9);
    opacity: 0;
  }
}

.dialog-enter-to,
.dialog-leave-from {
  opacity: 1;

  .auth-required-dialog {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
