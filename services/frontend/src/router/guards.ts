import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const getLocale = (route: RouteLocationNormalized): string => {
  return (route.params.locale as string) || 'en'
}

export const requireAuth = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    const locale = getLocale(to)
    next({
      name: 'login',
      params: { locale },
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}

export const requireGuest = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    const locale = getLocale(to)
    next({ name: 'home', params: { locale } })
  } else {
    next()
  }
}

export const requireRole = (role: string) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return requireAuth(to, from, next)
    }

    if (authStore.user?.role !== role) {
      const locale = getLocale(to)
      next({ name: 'forbidden', params: { locale } })
    } else {
      next()
    }
  }
}
