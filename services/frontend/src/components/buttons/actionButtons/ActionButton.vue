<script setup lang="ts">
export type Variant = 'default' | 'soft'
interface Props {
  variant?: Variant
  icon: string
  onClick: () => void
  ariaLabel: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <q-btn
    :icon="icon"
    :aria-label="ariaLabel"
    flat
    round
    dense
    :class="['action-button-base', variant === 'default' ? 'action-button' : 'action-button-soft']"
    @click="onClick"
  />
</template>

<style lang="scss" scoped>
.action-button-base {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: $z-index-dropdown;
}

.action-button {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: $color-white;
  transition: all $transition-slow;

  :deep(.q-icon) {
    color: $color-white;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }

  @media (max-width: $app-min-width) {
    left: $spacing-2;
  }
}

.action-button-soft {
  opacity: 0.6;
  transition: opacity $transition-slow;

  :deep(.q-icon) {
    color: $color-black;
    @include dark-mode {
      color: $color-white;
    }
  }

  &:hover {
    opacity: 1;
  }

  @media (max-width: $app-min-width) {
    left: $spacing-2;
  }
}
</style>
