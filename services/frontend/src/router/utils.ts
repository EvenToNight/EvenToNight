import { DEFAULT_LOCALE } from '@/i18n'
import { computed, ref } from 'vue'
import {
  useRouter,
  useRoute,
  type RouteLocationAsPathGeneric,
  type RouteLocationAsRelativeGeneric,
} from 'vue-router'
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
  CHAT_ROUTE_NAME,
  TICKET_PURCHASE_ROUTE_NAME,
} from '@/router'
import type { EventFilters } from '@/components/explore/filters/FiltersButton.vue'

export const pendingExploreFilters = ref<EventFilters | null>(null)

export const useNavigation = () => {
  const router = useRouter()
  const route = useRoute()

  const locale = computed(() => (route.params.locale as string) || DEFAULT_LOCALE)
  const params = route.params
  const query = route.query
  const hash = computed(() => route.hash)
  const routeName = computed(() => route.name as string)
  const redirect = computed(() => {
    return route.query.redirect as string | undefined
  })

  const replaceWithLocale = (
    name: string,
    additionalParams?: Record<string, any>,
    additionalQuery?: Record<string, any>,
    hash?: string
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
      ...(hash && { hash }),
    })
  }

  const pushWithLocale = (
    name: string,
    additionalParams?: Record<string, any>,
    additionalQuery?: Record<string, any>,
    hash?: string
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
      ...(hash && { hash }),
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

  const goToExplore = (
    initialFilter?: EventFilters & { searchQuery?: string },
    swap: boolean = false
  ) => {
    const queryParams: Record<string, string> = {}

    if (initialFilter) {
      if (initialFilter.searchQuery) {
        queryParams.search = initialFilter.searchQuery
      }
      if (initialFilter.dateFilter) {
        queryParams.dateFilter = initialFilter.dateFilter
      }
      if (initialFilter.dateRange) {
        queryParams.dateFrom = initialFilter.dateRange.from.toISOString()
        queryParams.dateTo = initialFilter.dateRange.to.toISOString()
      }
      if (initialFilter.priceFilter) {
        queryParams.priceFilter = initialFilter.priceFilter
      }
      if (initialFilter.customPriceRange) {
        if (
          initialFilter.customPriceRange.min !== undefined &&
          initialFilter.customPriceRange.min !== null
        ) {
          queryParams.priceMin = String(initialFilter.customPriceRange.min)
        }
        if (
          initialFilter.customPriceRange.max !== undefined &&
          initialFilter.customPriceRange.max !== null
        ) {
          queryParams.priceMax = String(initialFilter.customPriceRange.max)
        }
      }
      if (initialFilter.tags && initialFilter.tags.length > 0) {
        const tagsString = initialFilter.tags.filter((tag) => tag && tag.trim()).join(',')

        if (tagsString) {
          queryParams.tags = tagsString
        }
      }
      if (initialFilter.sortBy) {
        queryParams.sortBy = initialFilter.sortBy
      }
      if (initialFilter.otherFilter) {
        queryParams.otherFilter = String(initialFilter.otherFilter)
      }
    }

    if (swap) {
      replaceWithLocale(EXPLORE_ROUTE_NAME, {}, queryParams)
    } else {
      pushWithLocale(EXPLORE_ROUTE_NAME, {}, queryParams)
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

  const goToUserProfile = (userId: string, hash?: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(USER_PROFILE_ROUTE_NAME, { id: userId }, {}, hash)
    } else {
      pushWithLocale(USER_PROFILE_ROUTE_NAME, { id: userId }, {}, hash)
    }
  }

  const goToSettings = (swap: boolean = false, hash?: string) => {
    const routeConfig = {
      name: SETTINGS_ROUTE_NAME,
      params: {
        locale: locale.value,
      },
      ...(hash && { hash }),
    }
    if (swap) {
      router.replace(routeConfig)
    } else {
      router.push(routeConfig)
    }
  }

  const goToEditProfile = (swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(EDIT_PROFILE_ROUTE_NAME)
    } else {
      pushWithLocale(EDIT_PROFILE_ROUTE_NAME)
    }
  }

  const goToChat = (userId?: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(CHAT_ROUTE_NAME, undefined, { userId })
    } else {
      pushWithLocale(CHAT_ROUTE_NAME, undefined, { userId })
    }
  }

  const goToPurchaseTickets = (eventId: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(TICKET_PURCHASE_ROUTE_NAME, { id: eventId })
    } else {
      pushWithLocale(TICKET_PURCHASE_ROUTE_NAME, { id: eventId })
    }
  }

  const replaceRoute = (
    to: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
  ) => {
    router.replace(to)
  }

  const changeLocale = (newLocale: string) => {
    router.replace({
      name: route.name as string,
      params: {
        ...route.params,
        locale: newLocale,
      },
      query: route.query,
      hash: route.hash,
    })
  }

  const goToRoute = (routeName: string, swap: boolean = false) => {
    if (swap) {
      replaceWithLocale(routeName)
    } else {
      pushWithLocale(routeName)
    }
  }

  return {
    locale,
    params,
    query,
    hash,
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
    goToChat,
    goToPurchaseTickets,
    goToRoute,
    replaceRoute,
    changeLocale,
    removeQuery,
  }
}
