<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useQuasar } from 'quasar'
import { setTokenProvider, setTokenExpiredCallback } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const authStore = useAuthStore()
const $q = useQuasar()
useKeyboardShortcuts()

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  console.log('Saved dark mode preference:', savedDarkMode)
  if (savedDarkMode === 'true') {
    $q.dark.set(true)
  } else if (savedDarkMode === 'false') {
    $q.dark.set(false)
  } else {
    $q.dark.set('auto')
  }

  const refreshed = authStore.refreshCurrentSessionUserData()

  if (!refreshed && import.meta.env.VITE_AUTO_LOGIN === 'true') {
    try {
      authStore.register(
        import.meta.env.VITE_DEV_EMAIL.split('@')[0],
        import.meta.env.VITE_DEV_EMAIL,
        import.meta.env.VITE_DEV_PASSWORD,
        import.meta.env.VITE_DEV_ROLE === 'organization'
      )
    } catch (error) {
      console.error('Error when try to auto register user:', error)
    }
    try {
      authStore.login(import.meta.env.VITE_DEV_EMAIL, import.meta.env.VITE_DEV_PASSWORD)
    } catch (error) {
      console.error('Error when try to auto login user:', error)
    }
  }

  setTokenProvider(() => authStore.accessToken)
  setTokenExpiredCallback(async () => {
    return authStore.refreshAccessToken()
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
