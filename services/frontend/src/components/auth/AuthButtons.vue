<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import { useI18n } from 'vue-i18n'

interface Props {
  variant?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
})

const { t } = useI18n()
const { goToLogin, goToRegister } = useNavigation()
</script>

<template>
  <div :class="['auth-buttons', `auth-buttons--${variant}`]">
    <q-btn
      flat
      :label="t('auth.login')"
      :class="['base-button base-button--tertiary', { 'full-width': variant === 'vertical' }]"
      @click="() => goToLogin()"
    />

    <q-btn
      unelevated
      color="primary"
      :label="t('auth.register')"
      :class="['base-button base-button--primary', { 'full-width': variant === 'vertical' }]"
      @click="() => goToRegister()"
    />
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
.auth-buttons {
  display: flex;

  &--horizontal {
    flex: 0 1 auto;
    align-items: center;
    gap: $spacing-1;
    white-space: nowrap;
  }

  &--vertical {
    flex-direction: column;
    gap: $spacing-3;
  }
}
</style>
