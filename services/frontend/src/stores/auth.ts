import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, UserID } from '@/api/types/users'
import { api } from '@/api'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import type {
  AccessToken,
  LoginResponse,
  RefreshToken,
  TokenResponse,
} from '@/api/interfaces/users'
import { useNavigation } from '@/router/utils'
import { dateReviver } from '@/api/utils/parsingUtils'
export const DEFAULT_AVATAR_URL = `http://media.${import.meta.env.VITE_HOST || 'localhost'}/users/default.png`

const ACCESS_TOKEN_SESSION_KEY = 'access_token_session'
const TOKEN_EXPIRY_SESSION_KEY = 'token_expiry_session'
const REFRESH_TOKEN_SESSION_KEY = 'refresh_token_session'
const REFRESH_TOKEN_EXPIRY_SESSION_KEY = 'refresh_token_expiry_session'
const USER_SESSION_KEY = 'user_session'
export const useAuthStore = defineStore('auth', () => {
  const { t } = useI18n()
  const { locale, changeLocale } = useNavigation()
  const $q = useQuasar()
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => {
    if (!expiredAt.value) return false
    return expiredAt.value > Date.now()
  })
  const accessToken = ref<AccessToken | null>(null)
  const expiredAt = ref<number | null>(null)
  const refreshToken = ref<RefreshToken | null>(null)
  const refreshExpiredAt = ref<number | null>(null)

  const setTokens = (tokenResponse: TokenResponse) => {
    console.log('Setting tokens', tokenResponse)
    accessToken.value = tokenResponse.accessToken
    expiredAt.value = Date.now() + tokenResponse.expiresIn * 1000
    refreshToken.value = tokenResponse.refreshToken
    refreshExpiredAt.value = Date.now() + tokenResponse.refreshExpiresIn * 1000
    sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, accessToken.value)
    sessionStorage.setItem(TOKEN_EXPIRY_SESSION_KEY, expiredAt.value.toString())
    sessionStorage.setItem(REFRESH_TOKEN_SESSION_KEY, refreshToken.value)
    sessionStorage.setItem(REFRESH_TOKEN_EXPIRY_SESSION_KEY, refreshExpiredAt.value.toString())
  }

  const setUser = (authUser: User) => {
    user.value = authUser
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(authUser))
  }

  const setAuthData = async (authData: LoginResponse) => {
    setTokens(authData)
    setUser(authData.user)
    setupAutoRefresh()
    await api.notifications.connect(authData.user.id, authData.accessToken)
  }

  const clearAuth = () => {
    accessToken.value = null
    expiredAt.value = null
    refreshToken.value = null
    refreshExpiredAt.value = null
    user.value = null
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_SESSION_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_SESSION_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_EXPIRY_SESSION_KEY)
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
      await updateUser({
        language: locale.value,
        darkMode: $q.dark.isActive,
      })
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
      const data = await api.users.login({ username, password })
      await setAuthData(data)
      $q.dark.set(user.value?.darkMode || false)
      localStorage.setItem('user-locale', user.value!.language!)
      localStorage.setItem('darkMode', String($q.dark.isActive))
      changeLocale(user.value!.language!)
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
      if (refreshToken.value) {
        await api.users.logout(refreshToken.value).catch(() => {})
      }
    } finally {
      await api.notifications.disconnect()
      clearAuth()
      isLoading.value = false
      const currentLocale = window.location.pathname.split('/')[1]
      window.location.href = `/${currentLocale}`
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      if (refreshToken.value) {
        setTokens(await api.users.refreshToken(refreshToken.value as RefreshToken))
        return true
      }
      return false
    } catch {
      clearAuth()
      return false
    }
  }

  const updateUser = async (data: Partial<User> & { avatarFile?: File | null }): Promise<User> => {
    if (user.value?.id) {
      const { avatarFile, ...userData } = data
      //TODO: check if it works properly
      const updatedUser = { ...user.value, ...userData }

      if (avatarFile !== undefined) {
        if (avatarFile === null) {
          await api.users.deleteUserAvatarById(user.value.id)
          updatedUser.avatar = DEFAULT_AVATAR_URL
        } else {
          const response = await api.users.updateUserAvatarById(user.value.id, avatarFile)
          updatedUser.avatar = response.avatarUrl
        }
      }

      await api.users.updateUserById(user.value.id, updatedUser)
      if (userData.language) {
        await changeLocale(userData.language)
      }
      //TODO: sync last logged user settings? seems great
      localStorage.setItem('darkMode', String($q.dark.isActive))
      localStorage.setItem('user-locale', userData.language!)
      setUser(updatedUser)
    } else {
      throw new Error('Cannot update users')
    }
    return user.value!
  }

  const refreshCurrentSessionUserData = () => {
    const storedAccessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY)
    const storedExpiry = sessionStorage.getItem(TOKEN_EXPIRY_SESSION_KEY)
    const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_SESSION_KEY)
    const storedRefreshExpiry = sessionStorage.getItem(REFRESH_TOKEN_EXPIRY_SESSION_KEY)
    const expiresAt = storedExpiry ? parseInt(storedExpiry, 10) : undefined
    const expiresIn = expiresAt ? (expiresAt - Date.now()) / 1000 : undefined
    const refreshExpiresAt = storedRefreshExpiry ? parseInt(storedRefreshExpiry, 10) : undefined
    const refreshExpiresIn = refreshExpiresAt ? (refreshExpiresAt - Date.now()) / 1000 : undefined
    const storedUser = sessionStorage.getItem(USER_SESSION_KEY)
    if (
      storedAccessToken &&
      storedRefreshToken &&
      expiresIn &&
      expiresIn >= 0 &&
      refreshExpiresIn &&
      refreshExpiresIn >= 0 &&
      storedUser
    ) {
      setAuthData({
        accessToken: storedAccessToken,
        expiresIn: expiresIn,
        refreshToken: storedRefreshToken,
        refreshExpiresIn: refreshExpiresIn,
        user: JSON.parse(storedUser, dateReviver),
      })
      return true
    }
    return false
  }

  const setupAutoRefresh = () => {
    if (!refreshExpiredAt.value) return

    const timeUntilExpiry = refreshExpiredAt.value - Date.now()
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000 // 5 minutes before expiry
    if (refreshTime > 0) {
      setTimeout(() => {
        refreshAccessToken()
          .then((success) => {
            if (success) {
              setupAutoRefresh()
            }
          })
          .catch(() => {
            console.log('Failed to refresh token, logging out')
            logout()
          })
      }, refreshTime)
    } else {
      console.log('Refresh token already expired or about to expire, logging out')
      logout()
    }
  }

  const isOwnProfile = (profileUserId: UserID): boolean => {
    return user.value?.id === profileUserId
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user.value?.id) {
      throw new Error('User not authenticated')
    }

    isLoading.value = true
    try {
      await api.users.changePassword(user.value.id, {
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      })
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to change password')
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    accessToken,
    register,
    login,
    logout,
    refreshAccessToken,
    updateUser,
    refreshCurrentSessionUserData,
    setupAutoRefresh,
    clearAuth,
    isOwnProfile,
    changePassword,
  }
})
