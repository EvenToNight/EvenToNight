<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { watch } from 'vue'
import { goToLogin, goToRegister } from '@/router/utils'
import CloseButton from '@/components/buttons/actionButtons/CloseButton.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const close = () => {
  emit('update:isOpen', false)
}

const openLogin = () => {
  close()
  goToLogin(router, route)
}

const openRegister = () => {
  close()
  goToRegister(router, route)
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
    }
  }
)
</script>

<template>
  <Transition name="dialog">
    <div v-if="props.isOpen" class="dialog-overlay" @click="close">
      <q-card class="auth-required-dialog" @click.stop>
        <CloseButton class="close-button" @click="close" />

        <q-card-section class="dialog-header">
          <div class="dialog-icon">
            <q-icon name="lock" size="48px" />
          </div>
          <h2 class="dialog-title">{{ t('auth.notLoggedIn') }}</h2>
          <p class="dialog-message">{{ t('auth.loginRequired') }}</p>
        </q-card-section>

        <q-card-actions class="dialog-actions">
          <Button
            variant="primary"
            :label="t('nav.login')"
            class="action-button"
            @click="openLogin"
          />
          <Button
            variant="secondary"
            :label="t('nav.register')"
            class="action-button"
            @click="openRegister"
          />
        </q-card-actions>
      </q-card>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.dialog-overlay {
  @include fixed-fill;
  @include flex-center;
  background: $color-background-overlay;
  z-index: $z-index-modal;
}

.auth-required-dialog {
  max-width: 400px;
  width: calc(100% - #{$spacing-4 * 2});
  border-radius: $radius-2xl;
  padding: $spacing-4;
  position: relative;
}

.close-button {
  top: $spacing-2;
  right: $spacing-2;
  left: auto;
}

.dialog-header {
  @include flex-column-center;
  text-align: center;
  padding: $spacing-6;
}

.dialog-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  margin-bottom: $spacing-4;
}

.dialog-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-white;
  }
}

.dialog-message {
  font-size: $font-size-base;
  opacity: 0.7;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.dialog-actions {
  @include flex-column;
  gap: $spacing-2;
  padding: $spacing-4;
}

.action-button {
  width: 100%;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity $transition-base;

  .auth-required-dialog {
    transition:
      transform $transition-base,
      opacity $transition-base;
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
