<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import { useI18n } from 'vue-i18n'
import Button from '@/components/buttons/basicButtons/Button.vue'

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
    <Button
      variant="secondary"
      :label="t('nav.login')"
      :class="['auth-button', 'auth-button--login', { 'full-width': variant === 'vertical' }]"
      @click="goToLogin"
    />

    <Button
      variant="primary"
      :label="t('nav.register')"
      :class="['auth-button', 'auth-button--register', { 'full-width': variant === 'vertical' }]"
      @click="goToRegister"
    />
  </div>
</template>

<style scoped lang="scss">
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

.auth-button {
  .auth-buttons--vertical & {
    min-height: 48px;
    font-size: 16px;
  }
}
</style>
