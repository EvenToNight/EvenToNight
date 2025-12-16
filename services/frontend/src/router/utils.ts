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
  EXPLORE_ROUTE_NAME,
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

  const replaceWithLocale = (name: string, additionalParams?: Record<string, any>) => {
    router.replace({
      name,
      params: {
        locale: locale.value,
        ...additionalParams,
      },
    })
  }

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

  const goToRedirect = (swap: boolean = true) => {
    const redirectPath = redirect.value
    if (redirectPath) {
      if (swap) {
        router.replace(redirectPath)
      } else {
        router.push(redirectPath)
      }
      return true
    }
    return false
  }

  const goToHome = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(HOME_ROUTE_NAME)
    } else {
      pushWithLocale(HOME_ROUTE_NAME)
    }
  }

  const goToLogin = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(LOGIN_ROUTE_NAME)
    } else {
      pushWithLocale(LOGIN_ROUTE_NAME)
    }
  }

  const goToRegister = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(REGISTER_ROUTE_NAME)
    } else {
      pushWithLocale(REGISTER_ROUTE_NAME)
    }
  }

  const goToEventDetails = (eventId: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(EVENT_DETAILS_ROUTE_NAME, { id: eventId })
    } else {
      pushWithLocale(EVENT_DETAILS_ROUTE_NAME, { id: eventId })
    }
  }

  const goToExplore = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(EXPLORE_ROUTE_NAME)
    } else {
      pushWithLocale(EXPLORE_ROUTE_NAME)
    }
  }

  const goToCreateEvent = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(CREATE_EVENT_ROUTE_NAME)
    } else {
      pushWithLocale(CREATE_EVENT_ROUTE_NAME)
    }
  }

  const goToEditEvent = (eventId: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(EDIT_EVENT_ROUTE_NAME, { id: eventId })
    } else {
      pushWithLocale(EDIT_EVENT_ROUTE_NAME, { id: eventId })
    }
  }

  const goToUserProfile = (userId: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(USER_PROFILE_ROUTE_NAME, { id: userId })
    } else {
      pushWithLocale(USER_PROFILE_ROUTE_NAME, { id: userId })
    }
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
    goToExplore,
    goToCreateEvent,
    goToEditEvent,
    goToUserProfile,
    changeLocale,
  }
}
