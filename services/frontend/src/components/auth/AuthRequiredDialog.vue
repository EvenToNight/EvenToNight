<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

interface Props {
  modelValue: boolean
}

defineProps<Props>()
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
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="close">
    <q-card class="auth-required-dialog">
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
  </q-dialog>
</template>

<style scoped lang="scss">
.auth-required-dialog {
  min-width: 320px;
  max-width: 400px;
  border-radius: 16px;
  padding: $spacing-4;
  position: relative;

  @media (max-width: 768px) {
    min-width: 280px;
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
</style>
