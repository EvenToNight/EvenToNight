<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary'

interface Props {
  label?: string
  icon?: string
  variant?: ButtonVariant
  loading?: boolean
  type?: 'button' | 'submit'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  label: '',
  icon: '',
  loading: false,
  type: 'button',
})
</script>

<template>
  <q-btn
    :label="label"
    :icon="icon || undefined"
    :loading="loading"
    :type="type"
    :unelevated="variant === 'primary'"
    :flat="variant === 'secondary'"
    :color="variant === 'primary' ? 'primary' : undefined"
    :class="['base-button', `base-button--${variant}`]"
  />
</template>

<style lang="scss" scoped>
.base-button {
  padding: $spacing-3;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;

  // &--primary {}
  // &--secondary {}
}
</style>
