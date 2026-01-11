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
import { convertFiltersToEventsQueryParams } from '@/api/utils/searchUtils'
import { pendingExploreFilters } from '@/router/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))

const emit = defineEmits(['auth-required'])
const authStore = useAuthStore()
const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar', ref(false))

const ITEMS_PER_PAGE = 20
type ExploreTab = 'events' | 'organizations' | 'people'
const activeTab = ref<ExploreTab>('events')

const events = ref<{ event: Event; isFavorite: boolean }[]>([])
const hasMoreEvents = ref(true)
const loadingEvents = ref(false)

const organizations = ref<User[]>([])
const hasMoreOrganizations = ref(true)
const loadingOrganizations = ref(false)

const people = ref<User[]>([])
const hasMorePeople = ref(true)
const loadingPeople = ref(false)

const eventFilters = ref<EventsQueryParams>({})

const initialEventFilters = pendingExploreFilters.value || {}
pendingExploreFilters.value = null
provide('initialEventFilters', initialEventFilters)

const handleFiltersChanged = (newFilters: EventFilters) => {
  eventFilters.value = convertFiltersToEventsQueryParams(newFilters)
  console.log('Filters changed:', eventFilters.value, newFilters)
  searchEvents()
}

const searchEvents = async () => {
  console.log('Searching events for query:', searchQuery.value)
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
    events.value = response.items.map((event) => ({ event, isFavorite: false }))
    hasMoreEvents.value = response.hasMore
    if (authStore.user?.id) {
      const userId = authStore.user.id
      const likePromises = response.items.map(async (event) => {
        try {
          const isLiked = await api.interactions.userLikesEvent(event.eventId, userId)
          console.log(`Event ${event.eventId} is liked by user: ${isLiked}`)
          return { event, isFavorite: isLiked }
        } catch (error) {
          console.error(`Failed to load like status for event ${event.eventId}:`, error)
          return { event, isFavorite: false }
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
      name: searchQuery.value,
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
      name: searchQuery.value,
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

const onTabChange = (tabId: string) => {
  activeTab.value = tabId as ExploreTab
  if (searchQuery.value.trim()) {
    onSearch()
  }
}

const handleFavoriteToggle = async (eventId: string) => {
  if (!authStore.isAuthenticated || !authStore.user) {
    emit('auth-required')
    return
  }
  const isFavorite = !(
    events.value.find((event) => event.event.eventId === eventId)?.isFavorite ?? false
  )
  try {
    if (isFavorite) {
      await api.interactions.likeEvent(eventId, authStore.user.id)
      console.log(`Event ${eventId} liked`)
    } else {
      await api.interactions.unlikeEvent(eventId, authStore.user.id)
      console.log(`Event ${eventId} unliked`)
    }
    events.value = events.value.map((event) =>
      event.event.eventId === eventId ? { ...event, isFavorite } : event
    )
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

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
      onFavoriteToggle: handleFavoriteToggle,
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
        :variant="'explore'"
        :tabs="tabs"
        default-tab="events"
        @update:active-tab="onTabChange"
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
