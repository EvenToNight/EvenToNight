<script setup lang="ts">
import { useTranslation } from '@/composables/useTranslation'
const { t } = useTranslation('components.buttons.basicButtons.SeeAllButton')
interface Props {
  onClick: () => void
  variant?: 'default' | 'minimal'
}
withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <span class="see-all-link" :data-variant="variant" @click="onClick">
    <span class="see-all-text">{{ t('seeAll') }}</span>
    <q-icon v-if="variant === 'default'" name="arrow_forward" size="18px" class="see-all-arrow" />
  </span>
</template>

<style scoped lang="scss">
.see-all-link {
  @include flex-center;
  gap: $spacing-2;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  transition: all $transition-base;
  transform-origin: left center;
}

.see-all-link[data-variant='default'] {
  &:hover {
    transform: scale(1.05);
    gap: $spacing-3;
    .see-all-arrow {
      transform: scale(1.05);
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.see-all-link[data-variant='minimal'] {
  &:hover {
    text-decoration: underline;
  }
}
</style>
