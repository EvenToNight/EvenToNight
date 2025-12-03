import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { AuthenticatedUser } from '@/api/types/users'
import { api } from '@/api'

interface AuthTokens {
  accessToken: string
  expiresAt: number
}

// Access token in sessionStorage come fallback (si perde chiudendo il tab)
const ACCESS_TOKEN_SESSION_KEY = 'access_token_session'
const TOKEN_EXPIRY_SESSION_KEY = 'token_expiry_session'

export const useAuthStore = defineStore('auth', () => {
  const tokens = ref<AuthTokens | null>(null)
  // TODO evaluate where to store user info, pinia or local storage, maybe depends on refresh token strategy
  const user = ref<AuthenticatedUser | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => {
    if (!tokens.value) return false
    return tokens.value.expiresAt > Date.now()
  })
  const accessToken = computed(() => tokens.value?.accessToken || null)

  const setTokens = (authTokens: AuthTokens) => {
    tokens.value = authTokens
    // Store in sessionStorage as fallback (NOT localStorage for security)
    // SessionStorage is cleared when tab closes
    sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, authTokens.accessToken)
    sessionStorage.setItem(TOKEN_EXPIRY_SESSION_KEY, String(authTokens.expiresAt))
  }

  const setUser = (authUser: AuthenticatedUser) => {
    user.value = authUser
  }

  const clearAuth = () => {
    tokens.value = null
    user.value = null
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_SESSION_KEY)
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const data = await api.users.login({ email, password })

      // Response contains: { accessToken, expiresIn, user }
      // refreshToken is automatically set as httpOnly cookie by the server
      const expiresAt = Date.now() + data.expiresIn * 1000 // Convert seconds to ms

      setTokens({
        accessToken: data.accessToken,
        expiresAt,
      })

      setUser(data.user)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      // Call logout endpoint to invalidate refresh token cookie on server
      await api.users.logout().catch(() => {
        // Ignore logout errors, clear local state anyway
      })
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      // refreshToken is sent automatically via httpOnly cookie
      const data = await api.users.refreshToken()
      const expiresAt = Date.now() + data.expiresIn * 1000

      setTokens({
        accessToken: data.accessToken,
        expiresAt,
      })

      // Backend should include user info in refresh response
      if (data.user) {
        setUser(data.user)
      }

      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuth()
      return false
    }
  }

  const initializeAuth = () => {
    // Load access token from sessionStorage (if tab wasn't closed)
    const storedAccessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY)
    const storedExpiry = sessionStorage.getItem(TOKEN_EXPIRY_SESSION_KEY)

    if (storedAccessToken && storedExpiry) {
      const expiresAt = parseInt(storedExpiry, 10)

      // Check if token is expired
      if (expiresAt > Date.now()) {
        tokens.value = {
          accessToken: storedAccessToken,
          expiresAt,
        }
        // Still refresh to get user info if not in memory
        if (!user.value) {
          refreshAccessToken()
        }
      } else {
        // Try to refresh using httpOnly cookie (might still be valid)
        refreshAccessToken()
      }
    } else {
      // No access token in session, try to refresh using cookie
      // This will also fetch user info from backend
      refreshAccessToken()
    }
  }

  // Auto-refresh token before it expires
  const setupAutoRefresh = () => {
    if (!tokens.value) return

    const timeUntilExpiry = tokens.value.expiresAt - Date.now()
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000 // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      setTimeout(() => {
        refreshAccessToken().then((success) => {
          if (success) {
            setupAutoRefresh() // Setup next refresh
          }
        })
      }, refreshTime)
    }
  }

  // Auto-login for development
  const autoLogin = async () => {
    const autoLoginEnabled = import.meta.env.VITE_AUTO_LOGIN === 'true'
    const devEmail = import.meta.env.VITE_DEV_EMAIL
    const devPassword = import.meta.env.VITE_DEV_PASSWORD

    if (autoLoginEnabled && devEmail && devPassword) {
      console.log('🔐 Auto-login enabled for development')
      const result = await login(devEmail, devPassword)
      if (result.success) {
        console.log('✅ Auto-login successful')
      } else {
        console.error('❌ Auto-login failed:', result.error)
      }
    }
  }

  return {
    // State
    tokens,
    user,
    isLoading,

    // Computed
    isAuthenticated,
    accessToken,

    // Actions
    login,
    logout,
    refreshAccessToken,
    initializeAuth,
    setupAutoRefresh,
    autoLogin,
    clearAuth,
  }
})
