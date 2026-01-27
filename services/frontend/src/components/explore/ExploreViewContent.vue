<script setup lang="ts">
import { ref, watch, computed, inject, provide } from 'vue'
import type { Ref } from 'vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import type { User } from '@/api/types/users'
import type { SearchResult } from '@/api/utils/searchUtils'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import ExploreEventsTab from '@/components/explore/tabs/ExploreEventsTab.vue'
import ExplorePeopleTab from '@/components/explore/tabs/ExplorePeopleTab.vue'
import type { EventFilters } from './filters/FiltersButton.vue'
import type { EventsQueryParams } from '@/api/interfaces/events'
import { buildExploreFiltersFromQuery, buildExploreRouteQuery } from '@/api/utils/filtersUtils'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))

const normalizeQuery = (queryObj: any) => {
  return typeof queryObj === 'object' && queryObj !== null
    ? Object.fromEntries(
        Object.entries(queryObj).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? '') : (v ?? '')])
      )
    : {}
}

const normalizedQuery = normalizeQuery(route.query)
const initialEventFilters = buildExploreFiltersFromQuery(normalizedQuery)

// Reactive filters from URL for sync with FiltersButton
const filtersFromUrl = ref<EventFilters>(initialEventFilters)
provide('initialEventFilters', initialEventFilters)
provide('filtersFromUrl', filtersFromUrl)

const emit = defineEmits(['auth-required'])
const authStore = useAuthStore()
const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar', ref(false))

const ITEMS_PER_PAGE = 20
type ExploreTab = 'events' | 'organizations' | 'people'
const activeTab = ref<ExploreTab>('events')

const events = ref<(Event & { liked?: boolean })[]>([])
const hasMoreEvents = ref(true)
const loadingEvents = ref(false)

const organizations = ref<User[]>([])
const hasMoreOrganizations = ref(true)
const loadingOrganizations = ref(false)

const people = ref<User[]>([])
const hasMorePeople = ref(true)
const loadingPeople = ref(false)

const eventFilters = ref<EventsQueryParams>({})
const currentFilters = ref<EventFilters>(initialEventFilters)
const isUpdatingFromUrl = ref(false)

const handleFiltersChanged = (newFilters: EventFilters) => {
  currentFilters.value = newFilters
  eventFilters.value = buildExploreRouteQuery(newFilters)

  // Update URL with new filters
  if (!isUpdatingFromUrl.value) {
    const queryParams = buildExploreRouteQuery(newFilters)
    router.replace({
      name: route.name as string,
      params: route.params,
      query: queryParams,
    })
  }

  searchEvents()
}

// Watch for URL changes (e.g., browser back/forward)
watch(
  () => route.query,
  (newQuery) => {
    const normalized = normalizeQuery(newQuery)
    const filtersFromQuery = buildExploreFiltersFromQuery(normalized)

    // Only update if filters actually changed
    const newFiltersJson = JSON.stringify(filtersFromQuery)
    const currentFiltersJson = JSON.stringify(currentFilters.value)

    if (newFiltersJson !== currentFiltersJson) {
      isUpdatingFromUrl.value = true
      currentFilters.value = filtersFromQuery
      eventFilters.value = buildExploreRouteQuery(filtersFromQuery)

      // Update the reactive filters so FiltersButton can sync
      filtersFromUrl.value = filtersFromQuery

      searchEvents()

      // Reset flag after a tick to allow new changes
      setTimeout(() => {
        isUpdatingFromUrl.value = false
      }, 0)
    }
  }
)

const searchEvents = async () => {
  if (!searchQuery.value.trim() && !eventFilters.value) {
    events.value = []
    return
  }

  loadingEvents.value = true
  try {
    const response = await api.events.searchEvents({
      title: searchQuery.value || undefined,
      pagination: { limit: ITEMS_PER_PAGE },
      ...eventFilters.value,
    })
    events.value = response.items.map((event) => ({ ...event, liked: false }))
    hasMoreEvents.value = response.hasMore
    if (authStore.isAuthenticated) {
      const userId = authStore.user!.id
      const likePromises = events.value.map(async (event) => {
        try {
          const isLiked = await api.interactions.userLikesEvent(event.eventId, userId)
          return { ...event, liked: isLiked }
        } catch (error) {
          console.error(`Failed to load like status for event ${event.eventId}:`, error)
          return { ...event, liked: false }
        }
      })
      events.value = await Promise.all(likePromises)
    }
  } catch (error) {
    console.error('Failed to search events:', error)
  } finally {
    loadingEvents.value = false
  }
}

const searchOrganizations = async () => {
  if (!searchQuery.value.trim()) {
    organizations.value = []
    return
  }

  loadingOrganizations.value = true
  try {
    const response = await api.users.searchUsers({
      prefix: searchQuery.value,
      pagination: { limit: ITEMS_PER_PAGE },
      role: 'organization',
    })
    organizations.value = response.items
    hasMoreOrganizations.value = response.hasMore
  } catch (error) {
    console.error('Failed to search organizations:', error)
  } finally {
    loadingOrganizations.value = false
  }
}

const searchPeople = async () => {
  if (!searchQuery.value.trim()) {
    people.value = []
    return
  }
  loadingPeople.value = true
  try {
    const response = await api.users.searchUsers({
      prefix: searchQuery.value,
      pagination: { limit: ITEMS_PER_PAGE },
      role: 'member',
    })
    people.value = response.items
    hasMorePeople.value = response.hasMore
  } catch (error) {
    console.error('Failed to search people:', error)
  } finally {
    loadingPeople.value = false
  }
}

const onSearch = () => {
  switch (activeTab.value) {
    case 'events':
      searchEvents()
      break
    case 'organizations':
      searchOrganizations()
      break
    case 'people':
      searchPeople()
      break
  }
}

const initialSearchQuery = route.query.search as string | undefined
if (initialSearchQuery && initialSearchQuery.trim()) {
  searchQuery.value = initialSearchQuery.trim()
  onSearch()
}

watch(activeTab, (_tabId) => {
  if (searchQuery.value.trim()) {
    onSearch()
  }
})

const organizationsAsSearchResults = computed<SearchResult[]>(() => {
  return organizations.value.map((org) => ({
    type: 'organization',
    id: org.id,
    name: org.name,
    avatarUrl: org.avatar,
    relevance: 0,
  }))
})

const peopleAsSearchResults = computed<SearchResult[]>(() => {
  return people.value.map((person) => ({
    type: 'member',
    id: person.id,
    name: person.name,
    avatarUrl: person.avatar,
    relevance: 0,
  }))
})

const tabs = computed<Tab[]>(() => [
  {
    id: 'events',
    label: t('explore.events.title'),
    component: ExploreEventsTab,
    props: {
      events: events.value,
      loading: loadingEvents.value,
      searchQuery: searchQuery.value,
      onAuthRequired: () => emit('auth-required'),
      onFiltersChanged: handleFiltersChanged,
    },
  },
  {
    id: 'organizations',
    label: t('explore.organizations.title'),
    component: ExplorePeopleTab,
    props: {
      people: organizationsAsSearchResults.value,
      searchQuery: searchQuery.value,
      emptySearchText: t('explore.organizations.emptySearchText'),
      emptyText: t('explore.organizations.emptySearch'),
    },
  },
  {
    id: 'people',
    label: t('explore.users.title'),
    component: ExplorePeopleTab,
    props: {
      people: peopleAsSearchResults.value,
      searchQuery: searchQuery.value,
      emptySearchText: t('explore.users.emptySearchText'),
      emptyText: t('explore.users.emptySearch'),
    },
  },
])

watch(searchQuery, () => {
  onSearch()
})
</script>

<template>
  <div class="explore-page">
    <div class="explore-hero">
      <div class="explore-header">
        <h1 class="explore-title">{{ t('explore.title') }}</h1>
        <p class="explore-subtitle">{{ t('explore.subtitile') }}</p>
        <div ref="pageContentSearchBarRef" class="search-container">
          <div v-if="!showSearchInNavbar">
            <SearchBar ref="searchBarRef" />
          </div>
        </div>
      </div>
    </div>
    <div
      class="content-wrapper"
      :class="{ 'padded-content': !searchQuery, 'hide-tabs': !searchQuery }"
    >
      <TabView
        v-model:activeTab="activeTab"
        :variant="'explore'"
        :tabs="tabs"
        :default-tab="'events'"
      />
      <div class="colored-box"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.explore-page {
  @include flex-column;
  min-height: 100vh;
}

.explore-hero {
  background: linear-gradient(135deg, #6b46c1 0%, #7c3aed 50%, #8b5cf6 100%);

  @include dark-mode {
    background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%);
  }

  // Rounded corners only when viewport exceeds max-width
  @media (min-width: calc($app-max-width + 1px)) {
    border-radius: 24px;
  }
}

.explore-header {
  @include flex-column;
  align-items: center;
  padding: $spacing-8 $spacing-4 $spacing-6;
  gap: $spacing-4;
}

.explore-title {
  color: $color-white;
  margin: 0;
  text-align: center;
  font-size: 4rem;
  font-weight: 700;
  font-family: $font-family-heading;
  line-height: $line-height-tight;

  @media (max-width: $breakpoint-mobile) {
    font-size: 3rem;
  }
}

.explore-subtitle {
  color: $color-white;
  margin: 0;
  text-align: center;
  opacity: 0.95;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
}

.search-container {
  width: 100%;
  max-width: 600px;
  margin-top: $spacing-4;
}

.content-wrapper {
  @include flex-column;
  width: 100%;
}

.padded-content {
  padding: $spacing-4;
}

.colored-box {
  width: 100%;
  height: 800px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: $radius-xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.hide-tabs {
  :deep(.explore-tab-header) {
    display: none;
  }
}
</style>
