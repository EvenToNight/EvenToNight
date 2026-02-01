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
  <div class="app-brand" @click="goToHomeTop">
    <img src="/logo.png" :alt="t('brand.appName') + ' ' + t('brand.logo')" class="brand-logo" />
    <span class="brand-text">{{ t('brand.appName') }}</span>
  </div>
</template>

<style lang="scss" scoped>
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
  color: $color-primary;
  white-space: nowrap;
}
</style>
