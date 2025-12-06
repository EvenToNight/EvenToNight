<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { setTokenProvider, setTokenExpiredCallback } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
  authStore.setupAutoRefresh()

  if (import.meta.env.VITE_AUTO_LOGIN === 'true') {
    authStore.login(import.meta.env.VITE_DEV_EMAIL, import.meta.env.VITE_DEV_PASSWORD)
  }
  setTokenProvider(() => authStore.accessToken)
  setTokenExpiredCallback(async () => {
    const success = await authStore.refreshAccessToken()
    if (success) {
      authStore.setupAutoRefresh()
    }
    return success
  })

  // Dev logging
  const isDev = import.meta.env.DEV
  console.log(`🔌 API Mode: ${isDev ? 'MOCK (Development)' : 'REAL (Production)'}`)
  if (authStore.isAuthenticated) {
    console.log('🔐 User authenticated:', authStore.user?.email)
  }
  api.events
    .getTags()
    .then((tags) => {
      console.log('🏷️ Fetched event tags:', tags)
    })
    .catch((err) => {
      console.error('Failed to fetch event tags:', err)
    })
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
  min-width: $app-min-width;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

body {
  background-color: $color-white;
  min-width: $app-min-width;
}

body.body--dark {
  background-color: $color-background-dark;
}
</style>
