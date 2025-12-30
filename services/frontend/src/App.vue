<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useQuasar } from 'quasar'
import { setTokenProvider, setTokenExpiredCallback } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'

const authStore = useAuthStore()
const $q = useQuasar()

const handleKeyboardShortcut = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault()
    $q.dark.toggle()
    localStorage.setItem('darkMode', String($q.dark.isActive))
  }
}

onMounted(() => {
  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyboardShortcut)

  // Load dark mode preference from localStorage
  const savedDarkMode = localStorage.getItem('darkMode')
  console.log('Saved dark mode preference:', savedDarkMode)
  if (savedDarkMode === 'true') {
    $q.dark.set(true)
  } else if (savedDarkMode === 'false') {
    $q.dark.set(false)
  }
  // If null, use system preference (Quasar default)

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
  console.log(
    `🔌 API Mode("import.meta.env.DEV"): ${isDev ? 'MOCK (Development)' : 'REAL (Production)'}`
  )
  console.log(`🌐 Use HTTPS: ${import.meta.env.VITE_USE_HTTPS}`)

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

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut)
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

  .q-menu {
    background: #1e1e1e;
  }

  .q-item {
    color: #e0e0e0;

    &:hover {
      background: #2a2a2a;
    }
  }
}
</style>
