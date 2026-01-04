import { DEFAULT_LOCALE } from '@/i18n'
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HOME_ROUTE_NAME,
  LOGIN_ROUTE_NAME,
  REGISTER_ROUTE_NAME,
  EVENT_DETAILS_ROUTE_NAME,
  EVENT_REVIEWS_ROUTE_NAME,
  CREATE_EVENT_ROUTE_NAME,
  EDIT_EVENT_ROUTE_NAME,
  USER_PROFILE_ROUTE_NAME,
  EXPLORE_ROUTE_NAME,
  SETTINGS_ROUTE_NAME,
  EDIT_PROFILE_ROUTE_NAME,
  SUPPORT_ROUTE_NAME,
} from '@/router'
import type { EventFilters } from '@/components/explore/filters/FiltersButton.vue'

export const pendingExploreFilters = ref<EventFilters | null>(null)

export const useNavigation = () => {
  const router = useRouter()
  const route = useRoute()

  const locale = computed(() => (route.params.locale as string) || DEFAULT_LOCALE)
  const params = route.params
  const query = route.query
  const routeName = computed(() => route.name as string)
  const redirect = computed(() => {
    return route.query.redirect as string | undefined
  })

  const replaceWithLocale = (
    name: string,
    additionalParams?: Record<string, any>,
    additionalQuery?: Record<string, any>
  ) => {
    router.replace({
      name,
      params: {
        locale: locale.value,
        ...additionalParams,
      },
      query: {
        ...additionalQuery,
      },
    })
  }

  const pushWithLocale = (
    name: string,
    additionalParams?: Record<string, any>,
    additionalQuery?: Record<string, any>
  ) => {
    router.push({
      name,
      params: {
        locale: locale.value,
        ...additionalParams,
      },
      query: {
        ...additionalQuery,
      },
    })
  }

  const removeQuery = (key: string) => {
    const newQuery = { ...route.query }
    delete newQuery[key]
    router.replace({
      name: route.name as string,
      params: route.params,
      query: newQuery,
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

  const goToEventReviews = (organizationId: string, eventId?: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(EVENT_REVIEWS_ROUTE_NAME, { organizationId }, { eventId })
    } else {
      pushWithLocale(EVENT_REVIEWS_ROUTE_NAME, { organizationId }, { eventId })
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

  const goToSettings = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(SETTINGS_ROUTE_NAME)
    } else {
      pushWithLocale(SETTINGS_ROUTE_NAME)
    }
  }

  const goToEditProfile = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(EDIT_PROFILE_ROUTE_NAME)
    } else {
      pushWithLocale(EDIT_PROFILE_ROUTE_NAME)
    }
  }

  const goToSupport = (organizationId?: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(SUPPORT_ROUTE_NAME, undefined, { organizationId })
    } else {
      pushWithLocale(SUPPORT_ROUTE_NAME, undefined, { organizationId })
    }
  }

  const changeLocale = (newLocale: string, swap: boolean = false) => {
    if (swap) {
      router.replace({
        name: route.name as string,
        params: {
          ...route.params,
          locale: newLocale,
        },
        query: route.query,
      })
    } else {
      router.push({
        name: route.name as string,
        params: {
          ...route.params,
          locale: newLocale,
        },
        query: route.query,
      })
    }
  }

  return {
    locale,
    params,
    query,
    routeName,
    goBack,
    goToRedirect,
    goToHome,
    goToLogin,
    goToRegister,
    goToEventDetails,
    goToEventReviews,
    goToExplore,
    goToCreateEvent,
    goToEditEvent,
    goToUserProfile,
    goToSettings,
    goToEditProfile,
    goToSupport,
    changeLocale,
    removeQuery,
  }
}
