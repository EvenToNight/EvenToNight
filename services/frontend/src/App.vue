<script setup lang="ts">
import { RouterView } from 'vue-router'
import { api } from '@/api'

const isDev = import.meta.env.DEV
console.log(`🔌 API Mode: ${isDev ? 'MOCK (Development)' : 'REAL (Production)'}`)
api.events.getTags().then((tags) => console.log('Tags:', tags))
fetch('http://events.localhost/tags')
  .then((response) => {
    console.log('✅ Response status:', response.status)
    return response.json()
  })
  .then((tags) => {
    console.log('✅ Tags:', tags)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
  })
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style lang="scss">
.app-container {
  max-width: $app-max-width;
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
