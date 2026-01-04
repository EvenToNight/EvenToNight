import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, UserID } from '@/api/types/users'
import { api } from '@/api'
import { useI18n } from 'vue-i18n'
import { jwtDecode } from 'jwt-decode'
import type { AccessToken, LoginResponse } from '@/api/interfaces/users'

interface DecodedToken {
  user_id: UserID
  exp: number
}

// Access token in sessionStorage as fallback (lost when the tab is closed)
const ACCESS_TOKEN_SESSION_KEY = 'access_token_session'
const TOKEN_EXPIRY_SESSION_KEY = 'token_expiry_session'
const USER_SESSION_KEY = 'user_session'

export const useAuthStore = defineStore('auth', () => {
  const { t } = useI18n()
  const token = ref<AccessToken | null>(null)
  const decodedToken = ref<DecodedToken | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => {
    if (!decodedToken.value) return false
    return decodedToken.value.exp > Date.now() / 1000
  })
  const accessToken = computed(() => token.value || null)

  const setTokens = (authToken: LoginResponse) => {
    console.log('Auth token:', authToken)
    decodedToken.value = jwtDecode<DecodedToken>(authToken.token)
    console.log('Decoded token:', { ...decodedToken.value })
    token.value = authToken.token
    sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, token.value)
    sessionStorage.setItem(TOKEN_EXPIRY_SESSION_KEY, decodedToken.value!.exp.toString())
  }

  const setUser = (authUser: User) => {
    user.value = authUser
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(authUser))
  }

  const setAuthData = async (authData: LoginResponse) => {
    setTokens(authData)
    console.log('Fetching user with ID:', decodedToken.value!.user_id)
    const user: User = await api.users.getUserById(decodedToken.value!.user_id)
    console.log('Fetched user:', user)
    setUser(user)
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_SESSION_KEY)
    sessionStorage.removeItem(USER_SESSION_KEY)
  }

  const register = async (
    username: string,
    email: string,
    password: string,
    isOrganization: boolean
  ) => {
    isLoading.value = true
    try {
      setAuthData(
        await api.users.register({
          username,
          email,
          password,
          role: isOrganization ? 'organization' : 'member',
        })
      )
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

  const login = async (username: string, password: string) => {
    isLoading.value = true
    try {
      setAuthData(await api.users.login({ username, password }))
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
      // setAuthData(await api.users.refreshToken())
      return true
    } catch {
      clearAuth()
      return false
    }
  }

  const initializeAuth = () => {
    // const storedAccessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY)
    // const storedExpiry = sessionStorage.getItem(TOKEN_EXPIRY_SESSION_KEY)
    // const storedUser = sessionStorage.getItem(USER_SESSION_KEY)
    // const expiresAt = storedExpiry ? parseInt(storedExpiry, 10) : 0
    // if (storedAccessToken && expiresAt > Date.now() / 1000) {
    //   setTokens({ token: storedAccessToken })
    //   if (storedUser) {
    //     try {
    //       user.value = JSON.parse(storedUser)
    //     } catch (error) {
    //       console.error('Failed to parse stored user:', error)
    //       refreshAccessToken()
    //     }
    //   }
    // } else {
    //   refreshAccessToken()
    // }
  }

  const setupAutoRefresh = () => {
    if (!token.value) return

    const timeUntilExpiry = decodedToken.value!.exp - Date.now() / 1000
    const refreshTime = timeUntilExpiry - 5 * 60

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
