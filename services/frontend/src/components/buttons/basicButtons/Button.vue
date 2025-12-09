<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

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
    :flat="variant !== 'primary'"
    :color="variant === 'primary' ? 'primary' : undefined"
    :class="['base-button', `base-button--${variant}`]"
  />
</template>

<style lang="scss" scoped>
@use 'sass:color';
.base-button {
  padding: $spacing-3;
  font-size: $font-size-base;
  &--primary {
    background: $color-primary;
    color: $color-white;

    &:hover {
      background: color.adjust($color-primary, $lightness: -8%);
    }
  }

  &--secondary {
    border: 1px solid color-alpha($color-black, 0.12);
    color: $color-text-primary;
    &:hover {
      background: color-alpha($color-black, 0.04);
    }
    @include dark-mode {
      color: $color-text-dark;
      border-color: color-alpha($color-white, 0.12);

      &:hover {
        background: color-alpha($color-white, 0.04);
      }
    }
  }
}
</style>
