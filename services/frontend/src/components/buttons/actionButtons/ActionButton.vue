<script setup lang="ts">
export type Variant = 'default' | 'soft'
interface Props {
  variant?: Variant
  icon: string
  onClick: () => void
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <q-btn
    :icon="icon"
    flat
    round
    dense
    :class="variant === 'default' ? 'action-button' : 'action-button-soft'"
    @click="onClick"
  />
</template>

<style lang="scss" scoped>
.action-button {
  position: fixed;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white !important;
  transition: all 0.3s ease;

  :deep(.q-icon) {
    color: white !important;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }

  @media (max-width: 330px) {
    left: $spacing-2;
  }
}

.action-button-soft {
  position: fixed;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1000;
  opacity: 0.6;
  transition: opacity 0.2s ease;

  :deep(.q-icon) {
    @include light-mode {
      color: black !important;
    }
    @include dark-mode {
      color: white !important;
    }
  }

  &:hover {
    opacity: 1;
  }

  @media (max-width: 330px) {
    left: $spacing-2;
  }
}
</style>
