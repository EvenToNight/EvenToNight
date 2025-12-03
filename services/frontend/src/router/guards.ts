import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Guard per route che richiedono autenticazione
 */
export const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    // Salva la route di destinazione per redirect dopo login
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}

/**
 * Guard per route che richiedono l'utente NON autenticato (es. login, register)
 */
export const requireGuest = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    // Se già autenticato, vai alla home
    next({ name: 'home' })
  } else {
    next()
  }
}

/**
 * Guard per route che richiedono un ruolo specifico
 */
export const requireRole = (role: string) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
    } else if (authStore.user?.role !== role) {
      next({ name: 'forbidden' })
    } else {
      next()
    }
  }
}
