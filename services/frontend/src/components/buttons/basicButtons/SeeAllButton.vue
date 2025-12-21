<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
interface Props {
  onClick: () => void
}
defineProps<Props>()
</script>

<template>
  <span class="see-all-link" @click="onClick">
    <span class="see-all-text">{{ t('cards.slider.seeAll') }}</span>
    <q-icon name="arrow_forward" size="18px" class="see-all-arrow" />
  </span>
</template>

<style scoped lang="scss">
.see-all-link {
  @include flex-center;
  gap: $spacing-2;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  transition:
    transform $transition-base,
    gap $transition-base;
  transform-origin: left center;

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
</style>
