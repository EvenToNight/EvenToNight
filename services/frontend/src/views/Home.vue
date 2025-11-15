<script setup lang="ts">
import { useQuasar } from 'quasar'
import NavigationBar from '../components/NavigationBar.vue'

const $q = useQuasar()

const toggleDarkMode = () => {
  $q.dark.toggle()
}
</script>

<template>
  <div class="navigation-view">
    <NavigationBar />
    <div class="page-content">
      <div class="container">
        <h1>Navigation Demo</h1>
        <p>This page demonstrates the Quasar navigation bar.</p>

        <div class="theme-selector">
          <q-btn
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            :label="$q.dark.isActive ? 'Light Mode' : 'Dark Mode'"
            color="primary"
            @click="toggleDarkMode"
          />
        </div>
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

  .theme-selector {
    margin-top: $spacing-6;
  }
}
</style>
