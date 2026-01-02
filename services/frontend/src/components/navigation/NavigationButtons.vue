<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import AppBrand from '../common/AppBrand.vue'
import BackButton from '@/components/buttons/actionButtons/BackButton.vue'
import HomeButton from '@/components/buttons/actionButtons/HomeButton.vue'
import { NAVBAR_HEIGHT_CSS } from './NavigationBar.vue'

const { goBack, goToHome } = useNavigation()

interface Props {
  variant?: 'solid' | 'floating'
  showHomeButton?: boolean
}
withDefaults(defineProps<Props>(), {
  variant: 'solid',
  showHomeButton: true,
})
</script>

<template>
  <template v-if="variant === 'floating'">
    <nav class="floating-navigation-bar">
      <BackButton class="floating-nav-btn" />
      <HomeButton class="floating-nav-btn" />
    </nav>
  </template>
  <template v-else>
    <nav class="navigation-bar" :class="{ 'show-custom-content': $slots['left-custom-content'] }">
      <div class="nav-left">
        <q-btn flat round icon="arrow_back" class="nav-btn" @click="goBack" />
        <transition name="fade-slide">
          <div v-if="$slots['left-custom-content']" class="custom-content">
            <slot name="left-custom-content" />
          </div>
        </transition>
      </div>
      <div class="nav-center">
        <AppBrand v-if="!$slots['left-custom-content']" />
      </div>
      <div v-if="showHomeButton" class="nav-right">
        <q-btn flat round icon="home" class="nav-btn" @click="() => goToHome()" />
      </div>
    </nav>
  </template>
</template>

<style lang="scss" scoped>
.floating-navigation-bar {
  @include flex-between;
  position: sticky;
  top: 0;
  background: transparent;
  z-index: $z-index-sticky;
}
.floating-nav-btn {
  position: relative;
}
.navigation-bar {
  @include flex-between;
  position: sticky;
  top: 0;
  min-width: $app-min-width;
  width: 100%;
  height: v-bind(NAVBAR_HEIGHT_CSS);
  padding: 0 $spacing-4;
  background: $color-background;
  z-index: $z-index-sticky;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  @include dark-mode {
    background: $color-background-dark;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

.nav-left,
.nav-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.nav-left {
  justify-content: flex-start;
  gap: $spacing-3;
  overflow: hidden;
}

.nav-right {
  justify-content: flex-end;
  display: flex;
}

.nav-btn {
  flex-shrink: 0;
  color: $color-black;

  @include dark-mode {
    color: $color-white;
  }
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: none;
  align-items: center;

  :deep(.brand-logo) {
    display: none;
  }
}

.custom-content {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  min-width: 0;
  flex: 1;
}

// Fade slide transition
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (min-width: $breakpoint-mobile) {
  .nav-center {
    display: flex;
  }

  .navigation-bar.show-custom-content .nav-right {
    display: flex;
  }

  .nav-right {
    display: none;
  }
}
</style>
