import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, UserID } from '@/api/types/users'
import { api } from '@/api'
import { useI18n } from 'vue-i18n'

interface AuthToken {
  accessToken: string
  expiresAt: number
}

// Access token in sessionStorage as fallback (lost when the tab is closed)
const ACCESS_TOKEN_SESSION_KEY = 'access_token_session'
const TOKEN_EXPIRY_SESSION_KEY = 'token_expiry_session'
const USER_SESSION_KEY = 'user_session'

export const useAuthStore = defineStore('auth', () => {
  const { t } = useI18n()
  const token = ref<AuthToken | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => {
    if (!token.value) return false
    return token.value.expiresAt > Date.now()
  })
  const accessToken = computed(() => token.value?.accessToken || null)

  const setTokens = (authTokens: any) => {
    token.value = {
      accessToken: authTokens.accessToken,
      expiresAt: Date.now() + authTokens.expiresIn * 1000,
    }
    sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, token.value.accessToken)
    sessionStorage.setItem(TOKEN_EXPIRY_SESSION_KEY, token.value.expiresAt.toString())
  }

  const setUser = (authUser: User) => {
    user.value = authUser
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(authUser))
  }

  const setAuthData = (authData: any) => {
    setTokens(authData)
    if (authData.user) {
      setUser(authData.user)
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_SESSION_KEY)
    sessionStorage.removeItem(USER_SESSION_KEY)
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    isOrganization: boolean
  ) => {
    isLoading.value = true
    try {
      setAuthData(await api.users.register({ name, email, password, isOrganization }))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : t('auth.registerForm.failedRegistration'),
      }
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      setAuthData(await api.users.login({ email, password }))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : t('auth.loginForm.failedLogin'),
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await api.users.logout().catch(() => {})
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      // refreshToken is sent automatically via httpOnly cookie
      setAuthData(await api.users.refreshToken())
      return true
    } catch {
      clearAuth()
      return false
    }
  }

  const initializeAuth = () => {
    const storedAccessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY)
    const storedExpiry = sessionStorage.getItem(TOKEN_EXPIRY_SESSION_KEY)
    const storedUser = sessionStorage.getItem(USER_SESSION_KEY)
    const expiresAt = storedExpiry ? parseInt(storedExpiry, 10) : 0

    if (storedAccessToken && expiresAt > Date.now()) {
      token.value = {
        accessToken: storedAccessToken,
        expiresAt,
      }
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (error) {
          console.error('Failed to parse stored user:', error)
          refreshAccessToken()
        }
      }
    } else {
      refreshAccessToken()
    }
  }

  const setupAutoRefresh = () => {
    if (!token.value) return

    const timeUntilExpiry = token.value.expiresAt - Date.now()
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000 // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      setTimeout(() => {
        refreshAccessToken().then((success) => {
          if (success) {
            setupAutoRefresh()
          }
        })
      }, refreshTime)
    }
  }

  const isOwnProfile = (userId: UserID): boolean => {
    return isAuthenticated.value && user.value?.id === userId
  }

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    accessToken,
    register,
    login,
    logout,
    refreshAccessToken,
    initializeAuth,
    setupAutoRefresh,
    clearAuth,
    isOwnProfile,
  }
})
