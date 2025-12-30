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

<style lang="scss">
.outline-btn-fix.q-btn.q-btn--outline {
  color: #6f00ff !important;
  border-color: #6f00ff !important;
  background: transparent !important;

  .q-btn__content,
  .q-btn__content span,
  .q-btn__content div,
  .q-btn__content div span,
  .q-btn__content .block,
  span,
  span.block,
  span.q-ml-sm,
  .q-icon,
  i,
  i.q-icon,
  i.material-icons {
    color: #6f00ff !important;
  }

  // Deep selectors for scoped components
  :deep(.q-icon),
  :deep(i),
  :deep(i.material-icons),
  :deep(span),
  :deep(span.q-ml-sm),
  :deep(div),
  :deep(div span),
  :deep(.row span) {
    color: #6f00ff !important;
  }

  // Fix all interactive states
  &.q-btn--active,
  &:active,
  &:hover,
  &:focus,
  &.q-hoverable:hover,
  &.q-focusable:focus {
    color: #6f00ff !important;
    background: rgba(111, 0, 255, 0.1) !important;

    .q-btn__content,
    .q-btn__content span,
    .q-btn__content div,
    .q-btn__content div span,
    .q-btn__content .block,
    span,
    span.block,
    span.q-ml-sm,
    .q-icon,
    i,
    i.q-icon,
    i.material-icons {
      color: #6f00ff !important;
    }

    :deep(.q-icon),
    :deep(i),
    :deep(i.material-icons),
    :deep(span),
    :deep(span.q-ml-sm),
    :deep(div),
    :deep(div span),
    :deep(.row span) {
      color: #6f00ff !important;
    }
  }
}

body.body--dark .outline-btn-fix.q-btn.q-btn--outline {
  color: #bb86fc !important;
  border-color: #bb86fc !important;
  background: transparent !important;

  .q-btn__content,
  .q-btn__content span,
  .q-btn__content div,
  .q-btn__content div span,
  .q-btn__content .block,
  span,
  span.block,
  span.q-ml-sm,
  .q-icon,
  i,
  i.q-icon,
  i.material-icons {
    color: #bb86fc !important;
  }

  :deep(.q-icon),
  :deep(i),
  :deep(i.material-icons),
  :deep(span),
  :deep(span.q-ml-sm),
  :deep(div),
  :deep(div span),
  :deep(.row span) {
    color: #bb86fc !important;
  }

  // Fix all interactive states in dark mode
  &.q-btn--active,
  &:active,
  &:hover,
  &:focus,
  &.q-hoverable:hover,
  &.q-focusable:focus {
    color: #bb86fc !important;
    background: rgba(187, 134, 252, 0.1) !important;

    .q-btn__content,
    .q-btn__content span,
    .q-btn__content div,
    .q-btn__content div span,
    .q-btn__content .block,
    span,
    span.block,
    span.q-ml-sm,
    .q-icon,
    i,
    i.q-icon,
    i.material-icons {
      color: #bb86fc !important;
    }

    :deep(.q-icon),
    :deep(i),
    :deep(i.material-icons),
    :deep(span),
    :deep(span.q-ml-sm),
    :deep(div),
    :deep(div span),
    :deep(.row span) {
      color: #bb86fc !important;
    }
  }
}
</style>
