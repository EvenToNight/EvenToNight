<script setup lang="ts">
import NavigationBar, { NAVBAR_HEIGHT } from '@/components/navigation/NavigationBar.vue'
import Footer from '@/components/navigation/Footer.vue'
</script>

<template>
  <div class="navigation-layout">
    <NavigationBar />
    <div class="page-content">
      <slot></slot>
    </div>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.navigation-layout {
  @include flex-column;
  min-height: 100vh;
  position: relative;
  min-width: $app-min-width;
}

.page-content {
  flex: 1;
  margin-top: v-bind('`${NAVBAR_HEIGHT}px`');
}
</style>
