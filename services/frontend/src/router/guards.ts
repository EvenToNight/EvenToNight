import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { EDIT_EVENT_ROUTE_NAME, FORBIDDEN_ROUTE_NAME, HOME_ROUTE_NAME, LOGIN_ROUTE_NAME } from '.'

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
      name: LOGIN_ROUTE_NAME,
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
    next({ name: HOME_ROUTE_NAME, params: { locale } })
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
      next({ name: FORBIDDEN_ROUTE_NAME, params: { locale } })
    } else {
      next()
    }
  }
}

export const requireEventCreator = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return requireAuth(to, from, next)
  }

  const eventId = to.params.id as string
  if (!eventId) {
    const locale = getLocale(to)
    next({ name: HOME_ROUTE_NAME, params: { locale } })
    return
  }

  try {
    const event = await api.events.getEventById(eventId)
    if (event.id_creator !== authStore.user?.id) {
      const locale = getLocale(to)
      next({ name: FORBIDDEN_ROUTE_NAME, params: { locale } })
    } else {
      next()
    }
  } catch (error) {
    console.error('Failed to verify event creator:', error)
    const locale = getLocale(to)
    next({ name: HOME_ROUTE_NAME, params: { locale } })
  }
}

export const requireNotDraft = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const eventId = to.params.id as string

  if (!eventId) {
    const locale = getLocale(to)
    next({ name: HOME_ROUTE_NAME, params: { locale } })
    return
  }

  try {
    const event = await api.events.getEventById(eventId)
    if (event.status === 'DRAFT') {
      const locale = getLocale(to)
      if (authStore.user?.id === event.id_creator) {
        next({ name: EDIT_EVENT_ROUTE_NAME, params: { locale, id: eventId } })
      } else {
        next({ name: HOME_ROUTE_NAME, params: { locale } })
      }
    } else {
      next()
    }
  } catch (error) {
    console.error('Failed to load event:', error)
    const locale = getLocale(to)
    next({ name: HOME_ROUTE_NAME, params: { locale } })
  }
}
