import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { DEFAULT_LOCALE } from '@/i18n'
import {
  HOME_ROUTE_NAME,
  LOGIN_ROUTE_NAME,
  REGISTER_ROUTE_NAME,
  EVENT_DETAILS_ROUTE_NAME,
} from '@/router'

export const getLocaleParam = (route: RouteLocationNormalizedLoaded): string => {
  return (route.params.locale as string) || DEFAULT_LOCALE
}

export const goBack = (router: Router) => {
  router.back()
}

export const goHome = (router: Router, route: RouteLocationNormalizedLoaded) => {
  router.push({ name: HOME_ROUTE_NAME, params: { locale: getLocaleParam(route) } })
}

export const goToLogin = (router: Router, route: RouteLocationNormalizedLoaded) => {
  router.push({ name: LOGIN_ROUTE_NAME, params: { locale: getLocaleParam(route) } })
}

export const goToRegister = (router: Router, route: RouteLocationNormalizedLoaded) => {
  router.push({ name: REGISTER_ROUTE_NAME, params: { locale: getLocaleParam(route) } })
}

export const goToEventDetails = (
  router: Router,
  route: RouteLocationNormalizedLoaded,
  eventId: string
) => {
  router.push({
    name: EVENT_DETAILS_ROUTE_NAME,
    params: { locale: getLocaleParam(route), id: eventId },
  })
}
