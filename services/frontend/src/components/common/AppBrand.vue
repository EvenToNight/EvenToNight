<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import { useTranslation } from '@/composables/useTranslation'

const { t } = useTranslation('components.common.AppBrand')
const { goToHome } = useNavigation()

const goToHomeTop = () => {
  goToHome()
  window.scrollTo({ top: 0, behavior: 'auto' }) // 'smooth'
}
</script>

<template>
  <div
    class="app-brand"
    role="button"
    tabindex="0"
    @click="goToHomeTop"
    @keydown.enter="goToHomeTop"
  >
    <img src="/logo.png" :alt="t('altText')" class="brand-logo" />
    <span class="brand-text">{{ t('appName') }}</span>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.app-brand {
  @include flex-center;
  gap: $spacing-2;
  cursor: pointer;
}

.brand-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  white-space: nowrap;

  @include light-mode {
    color: $color-primary;
  }

  @include dark-mode {
    color: color.scale($color-primary, $lightness: 50%);
  }
}
</style>
