<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style lang="scss">
.app-container {
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

// Body background for color bands on sides
body {
  background-color: #ffffff;
}

body.body--dark {
  background-color: #1d1d1d;
}
</style>
