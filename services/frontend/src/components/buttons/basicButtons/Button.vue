<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'flat'

interface Props {
  label: string
  variant?: ButtonVariant
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
})
</script>

<template>
  <q-btn
    :label="label"
    :unelevated="variant === 'primary'"
    :flat="variant === 'flat' || variant === 'secondary'"
    :color="variant === 'primary' ? 'primary' : undefined"
  />
</template>

<style lang="scss">
.q-btn {
  padding: $spacing-3;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
}
</style>
