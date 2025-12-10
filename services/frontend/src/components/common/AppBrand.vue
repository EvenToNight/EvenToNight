<script setup lang="ts">
import { useNavigation } from '@/router/utils'

const { goToHome } = useNavigation()

const goToHomeTop = () => {
  goToHome()
  window.scrollTo({ top: 0, behavior: 'auto' }) // 'smooth'
}
</script>

<template>
  <div class="app-brand" @click="goToHomeTop">
    <img src="/logo.png" alt="EvenToNight Logo" class="brand-logo" />
    <span class="brand-text">EvenToNight</span>
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
