<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import AppBrand from '../common/AppBrand.vue'
import BackButton from '@/components/buttons/actionButtons/BackButton.vue'
import HomeButton from '@/components/buttons/actionButtons/HomeButton.vue'
import { NAVBAR_HEIGHT_CSS } from './NavigationBar.vue'

const { goBack, goToHome } = useNavigation()

interface Props {
  variant?: 'solid' | 'floating'
}
withDefaults(defineProps<Props>(), {
  variant: 'solid',
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
    <nav class="navigation-bar">
      <div class="nav-left">
        <q-btn flat round icon="arrow_back" class="nav-btn" @click="goBack" />
      </div>
      <div class="nav-center">
        <AppBrand />
      </div>
      <div class="nav-right">
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
}

.nav-left {
  justify-content: flex-start;
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

  :deep(.brand-logo) {
    display: none;
  }
}

@media (min-width: $breakpoint-mobile) {
  .nav-center {
    display: flex;
  }

  .nav-right {
    display: none;
  }
}
</style>
