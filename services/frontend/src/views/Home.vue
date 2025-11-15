<script setup lang="ts">
import NavigationBar from '../components/NavigationBar.vue'
</script>

<template>
  <div class="navigation-view">
    <NavigationBar />
    <div class="page-content">
      <div class="container">
        <h1>Navigation Demo</h1>
        <p>This page demonstrates the Quasar navigation bar.</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-view {
  min-height: 100vh;
}

.page-content {
  padding: $spacing-8 $spacing-4;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: $spacing-4;
  }
}
</style>
