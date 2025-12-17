<script setup lang="ts">
import { ref, watch, computed, inject } from 'vue'
import type { Ref } from 'vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import type { User } from '@/api/types/users'
import type { SearchResult } from '@/api/utils'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import ExploreEventsTab from '@/components/explore/tabs/ExploreEventsTab.vue'
import ExplorePeopleTab from '@/components/explore/tabs/ExplorePeopleTab.vue'
import type { EventFilters } from './filters/FiltersButton.vue'
import type { EventsQueryParams } from '@/api/interfaces/events'
import { convertFiltersToEventsQueryParams } from '@/api/utils'

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

const handleFavoriteToggle = async (eventId: string, isFavorite: boolean) => {
  if (!authStore.isAuthenticated || !authStore.user) {
    emit('auth-required')
    return
  }

  try {
    if (isFavorite) {
      await api.interactions.likeEvent(eventId, authStore.user.id)
      console.log(`Event ${eventId} liked`)
    } else {
      await api.interactions.unlikeEvent(eventId, authStore.user.id)
      console.log(`Event ${eventId} unliked`)
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

const organizationsAsSearchResults = computed<SearchResult[]>(() => {
  return organizations.value.map((org) => ({
    type: 'organization' as const,
    id: org.id,
    name: org.name,
    avatarUrl: org.avatarUrl,
    relevance: 0,
  }))
})

const peopleAsSearchResults = computed<SearchResult[]>(() => {
  return people.value.map((person) => ({
    type: 'member' as const,
    id: person.id,
    name: person.name,
    avatarUrl: person.avatarUrl,
    relevance: 0,
  }))
})

const tabs = computed<Tab[]>(() => [
  {
    id: 'events',
    label: 'Eventi',
    component: ExploreEventsTab,
    props: {
      events: events.value,
      loading: loadingEvents.value,
      searchQuery: searchQuery.value,
      onFavoriteToggle: handleFavoriteToggle,
      onAuthRequired: () => emit('auth-required'),
      onFiltersChanged: handleFiltersChanged,
    },
  },
  {
    id: 'organizations',
    label: 'Organizzazioni',
    component: ExplorePeopleTab,
    props: {
      people: organizationsAsSearchResults.value,
      searchQuery: searchQuery.value,
      emptySearchText: 'Cerca organizzazioni per nome',
      emptyText: 'Nessuna organizzazione trovata',
    },
  },
  {
    id: 'people',
    label: 'Persone',
    component: ExplorePeopleTab,
    props: {
      people: peopleAsSearchResults.value,
      searchQuery: searchQuery.value,
      emptySearchText: 'Cerca persone per nome',
      emptyText: 'Nessuna persona trovata',
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
        <h1 class="explore-title">Esplora</h1>
        <p class="explore-subtitle">Trova eventi, organizzatori o connettiti con i tuoi amici</p>
        <div ref="pageContentSearchBarRef" class="search-container">
          <div v-if="!showSearchInNavbar">
            <SearchBar ref="searchBarRef" />
          </div>
        </div>
      </div>
    </div>
    <div class="content-wrapper">
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

.colored-box {
  width: 100%;
  height: 800px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: $radius-xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>
