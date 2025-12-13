import { DEFAULT_LOCALE } from '@/i18n'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HOME_ROUTE_NAME,
  LOGIN_ROUTE_NAME,
  REGISTER_ROUTE_NAME,
  EVENT_DETAILS_ROUTE_NAME,
  CREATE_EVENT_ROUTE_NAME,
  EDIT_EVENT_ROUTE_NAME,
  USER_PROFILE_ROUTE_NAME,
} from '@/router'

export const useNavigation = () => {
  const router = useRouter()
  const route = useRoute()

  const locale = computed(() => (route.params.locale as string) || DEFAULT_LOCALE)
  const params = route.params
  const routeName = computed(() => route.name as string)
  const redirect = computed(() => {
    return route.query.redirect as string | undefined
  })

  const pushWithLocale = (name: string, additionalParams?: Record<string, any>) => {
    router.push({
      name,
      params: {
        locale: locale.value,
        ...additionalParams,
      },
    })
  }

  const goBack = () => {
    router.back()
  }

  const goToRedirect = () => {
    const redirectPath = redirect.value
    if (redirectPath) {
      router.push(redirectPath)
      return true
    }
    return false
  }

  const goToHome = () => {
    pushWithLocale(HOME_ROUTE_NAME)
  }

  const goToLogin = () => {
    pushWithLocale(LOGIN_ROUTE_NAME)
  }

  const goToRegister = () => {
    pushWithLocale(REGISTER_ROUTE_NAME)
  }

  const goToEventDetails = (eventId: string) => {
    pushWithLocale(EVENT_DETAILS_ROUTE_NAME, { id: eventId })
  }

  const goToCreateEvent = () => {
    pushWithLocale(CREATE_EVENT_ROUTE_NAME)
  }

  const goToEditEvent = (eventId: string) => {
    pushWithLocale(EDIT_EVENT_ROUTE_NAME, { id: eventId })
  }

  const goToUserProfile = (userId: string) => {
    pushWithLocale(USER_PROFILE_ROUTE_NAME, { id: userId })
  }

  const changeLocale = (newLocale: string) => {
    router.push({
      name: route.name as string,
      params: {
        ...route.params,
        locale: newLocale,
      },
      query: route.query,
    })
  }

  return {
    locale,
    params,
    routeName,
    goBack,
    goToRedirect,
    goToHome,
    goToLogin,
    goToRegister,
    goToEventDetails,
    goToCreateEvent,
    goToEditEvent,
    goToUserProfile,
    changeLocale,
  }
}
