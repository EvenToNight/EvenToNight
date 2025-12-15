<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, inject } from 'vue'
import type { Ref } from 'vue'
// import type { SearchResult } from '@/api/utils'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import type { User } from '@/api/types/users'
import EventCardVariant from '@/components/cards/EventCardVariant.vue'
import UserCard from '@/components/cards/UserCard.vue'
import SearchBar from '@/components/navigation/SearchBar.vue'

//const emit = defineEmits(['auth-required'])

const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>(
  'pageContentSearchBarRef',
  ref(null)
)
// const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar', ref(false))
const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
// const searchResults = inject<Ref<SearchResult[]>>('searchResults', ref([]))
// const searchBarHasFocus = inject<Ref<boolean>>('searchBarHasFocus', ref(false))

const activeTab = ref<'events' | 'organizations' | 'people'>('events')

const events = ref<Event[]>([])
const loadingEvents = ref(false)

const organizations = ref<User[]>([])
const loadingOrganizations = ref(false)

const people = ref<User[]>([])
const loadingPeople = ref(false)

const filtersMenuOpen = ref(false)
const filtersButtonRef = ref<HTMLElement | null>(null)
const tabsContainerRef = ref<HTMLElement | null>(null)

const _hasMoreEvents = ref(false)

const ITEMS_PER_PAGE = 20

// Event filters
const selectedDateFilter = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const selectedPriceFilter = ref<string | null>(null)

const dateFilters = [
  { label: 'Oggi', value: 'today' },
  { label: 'Questa settimana', value: 'this_week' },
  { label: 'Questo mese', value: 'this_month' },
]

const tagFilters = ['Musica', 'Sport', 'Arte', 'Teatro', 'Cinema', 'Cibo']

const priceFilters = [
  { label: 'Gratis', value: 'free' },
  { label: 'A pagamento', value: 'paid' },
]

const toggleDateFilter = (value: string) => {
  selectedDateFilter.value = selectedDateFilter.value === value ? null : value
  searchEvents()
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  searchEvents()
}

const togglePriceFilter = (value: string) => {
  selectedPriceFilter.value = selectedPriceFilter.value === value ? null : value
  searchEvents()
}

const clearFilters = () => {
  selectedDateFilter.value = null
  selectedTags.value = []
  selectedPriceFilter.value = null
  searchEvents()
}

const hasActiveFilters = computed(
  () =>
    selectedDateFilter.value !== null ||
    selectedTags.value.length > 0 ||
    selectedPriceFilter.value !== null
)

const searchEvents = async () => {
  if (!searchQuery.value.trim()) {
    events.value = []
    return
  }

  loadingEvents.value = true
  try {
    const response = await api.events.searchByName(searchQuery.value, { limit: ITEMS_PER_PAGE })
    events.value = response.items
    _hasMoreEvents.value = response.hasMore
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
    const response = await api.users.getOrganizations(searchQuery.value, {
      limit: ITEMS_PER_PAGE,
    })
    organizations.value = response.users
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
    const response = await api.users.searchByName(searchQuery.value)
    people.value = response.users
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

const switchTab = (tab: 'events' | 'organizations' | 'people') => {
  activeTab.value = tab
  if (searchQuery.value.trim()) {
    onSearch()
  }
}

watch(searchQuery, () => {
  onSearch()
})

const isElementHiddenBehindStickyHeader = (el: HTMLElement | null) => {
  if (!el) return true
  const rect = el.getBoundingClientRect()
  const tabsContainer = tabsContainerRef.value
  if (!tabsContainer) return false
  const tabsRect = tabsContainer.getBoundingClientRect()
  const stickyHeaderHeight = tabsRect.bottom
  return rect.top < stickyHeaderHeight
}

const handleScroll = () => {
  if (filtersMenuOpen.value && isElementHiddenBehindStickyHeader(filtersButtonRef.value)) {
    filtersMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<template>
  <div class="explore-page">
    <!-- Header Section -->
    <div class="explore-hero">
      <div class="explore-header">
        <h1 class="explore-title">Esplora</h1>
        <p class="explore-subtitle">Trova eventi, organizzatori o connettiti con i tuoi amici</p>

        <!-- Search Bar -->
        <div ref="pageContentSearchBarRef" class="search-container">
          <SearchBar
            v-model:search-query="searchQuery"
            search-hint="Cerca eventi, organizzazioni o persone..."
          />
        </div>
      </div>
    </div>

    <!-- Tabs (Sticky) -->
    <div ref="tabsContainerRef" class="explore-tabs-container">
      <div class="explore-tabs">
        <div
          class="explore-tab"
          :class="{ active: activeTab === 'events' }"
          @click="switchTab('events')"
        >
          Eventi
        </div>
        <div
          class="explore-tab"
          :class="{ active: activeTab === 'organizations' }"
          @click="switchTab('organizations')"
        >
          Organizzazioni
        </div>
        <div
          class="explore-tab"
          :class="{ active: activeTab === 'people' }"
          @click="switchTab('people')"
        >
          Persone
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="explore-content">
      <!-- Events Tab -->
      <div v-if="activeTab === 'events'" class="tab-content">
        <!-- Filters Button -->
        <!-- <div v-if="searchQuery" class="filters-button-wrapper"> -->

        <div ref="filtersButtonRef" class="filters-button-wrapper">
          <q-btn outline color="primary" label="Filtri" class="outline-btn-fix">
            <q-badge
              v-if="hasActiveFilters"
              floating
              class="filter-badge"
              :style="{ color: 'white !important' }"
            >
              {{
                (selectedDateFilter ? 1 : 0) + selectedTags.length + (selectedPriceFilter ? 1 : 0)
              }}
            </q-badge>
            <q-menu v-model="filtersMenuOpen">
              <div class="filters-menu">
                <!-- Date Filters -->
                <div class="filter-group">
                  <span class="filter-label">Data:</span>
                  <div class="filter-chips">
                    <q-chip
                      v-for="filter in dateFilters"
                      :key="filter.value"
                      :outline="selectedDateFilter !== filter.value"
                      :color="selectedDateFilter === filter.value ? 'primary' : 'grey-3'"
                      :text-color="selectedDateFilter === filter.value ? 'white' : 'grey-8'"
                      clickable
                      @click="toggleDateFilter(filter.value)"
                    >
                      {{ filter.label }}
                    </q-chip>
                  </div>
                </div>

                <!-- Tag Filters -->
                <div class="filter-group">
                  <span class="filter-label">Categoria:</span>
                  <div class="filter-chips">
                    <q-chip
                      v-for="tag in tagFilters"
                      :key="tag"
                      :outline="!selectedTags.includes(tag)"
                      :color="selectedTags.includes(tag) ? 'primary' : 'grey-3'"
                      :text-color="selectedTags.includes(tag) ? 'white' : 'grey-8'"
                      clickable
                      @click="toggleTag(tag)"
                    >
                      {{ tag }}
                    </q-chip>
                  </div>
                </div>

                <!-- Price Filters -->
                <div class="filter-group">
                  <span class="filter-label">Prezzo:</span>
                  <div class="filter-chips">
                    <q-chip
                      v-for="filter in priceFilters"
                      :key="filter.value"
                      :outline="selectedPriceFilter !== filter.value"
                      :color="selectedPriceFilter === filter.value ? 'primary' : 'grey-3'"
                      :text-color="selectedPriceFilter === filter.value ? 'white' : 'grey-8'"
                      clickable
                      @click="togglePriceFilter(filter.value)"
                    >
                      {{ filter.label }}
                    </q-chip>
                  </div>
                </div>

                <!-- Clear Filters Button -->
                <q-btn
                  v-if="hasActiveFilters"
                  flat
                  dense
                  color="grey-7"
                  icon="clear"
                  label="Cancella filtri"
                  class="clear-filters-btn"
                  @click="clearFilters"
                />
              </div>
            </q-menu>
          </q-btn>
        </div>

        <div v-if="loadingEvents" class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
        <div v-else-if="events.length > 0" class="events-grid">
          <EventCardVariant v-for="event in events" :key="event.id_event" :event="event" />
        </div>
        <div v-else-if="searchQuery" class="empty-state">
          <q-icon name="event_busy" size="64px" color="grey-5" />
          <p class="empty-text">Nessun evento trovato</p>
        </div>
        <div v-else class="empty-state">
          <q-icon name="search" size="64px" color="grey-5" />
          <p class="empty-text">Cerca eventi per nome</p>
        </div>
      </div>

      <!-- Organizations Tab -->
      <div v-else-if="activeTab === 'organizations'" class="tab-content">
        <div v-if="loadingOrganizations" class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
        <div v-else-if="organizations.length > 0" class="users-list">
          <UserCard v-for="org in organizations" :key="org.id" :user="org" />
        </div>
        <div v-else-if="searchQuery" class="empty-state">
          <q-icon name="business" size="64px" color="grey-5" />
          <p class="empty-text">Nessuna organizzazione trovata</p>
        </div>
        <div v-else class="empty-state">
          <q-icon name="search" size="64px" color="grey-5" />
          <p class="empty-text">Cerca organizzazioni per nome</p>
        </div>
      </div>

      <!-- People Tab -->
      <div v-else-if="activeTab === 'people'" class="tab-content">
        <div v-if="loadingPeople" class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
        <div v-else-if="people.length > 0" class="users-list">
          <UserCard v-for="person in people" :key="person.id" :user="person" />
        </div>
        <div v-else-if="searchQuery" class="empty-state">
          <q-icon name="people" size="64px" color="grey-5" />
          <p class="empty-text">Nessuna persona trovata</p>
        </div>
        <div v-else class="empty-state">
          <q-icon name="search" size="64px" color="grey-5" />
          <p class="empty-text">Cerca persone per nome</p>
        </div>
      </div>
    </div>
    <div class="colored-box"></div>
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

.search-input {
  background: $color-white;
  border-radius: $radius-xl;

  :deep(.q-field__control) {
    border-radius: $radius-xl;
    height: 56px;
  }

  :deep(.q-field__prepend) {
    padding-left: $spacing-2;
  }
}

.explore-tabs-container {
  position: sticky;
  top: 64px; // NavigationBar height
  z-index: 10; // Below navbar but above content
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: $spacing-4 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  @include dark-mode {
    background: rgba(18, 18, 18, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.explore-tabs {
  display: flex;
  justify-content: center;
  gap: $spacing-8;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; // Firefox
  max-width: $app-max-width;
  margin: 0 auto;
  padding: 0 $spacing-6;

  &::-webkit-scrollbar {
    display: none; // Chrome, Safari
  }

  @media (max-width: $breakpoint-mobile) {
    gap: $spacing-6;
    padding: 0 $spacing-4;
  }
  @media (max-width: $app-min-width) {
    justify-content: flex-start;
    gap: $spacing-4;
  }
}

.explore-tab {
  color: $color-heading;
  opacity: 0.6;
  cursor: pointer;
  padding-bottom: $spacing-2;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  user-select: none;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  font-family: $font-family-heading;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }

  &.active {
    opacity: 1;
    border-bottom-color: $color-primary;
  }

  @include dark-mode {
    color: $color-white;
  }
}

.explore-content {
  flex: 1;
  padding: $spacing-6 $spacing-4;
  max-width: $app-max-width;
  width: 100%;
  margin: 0 auto;
}

.tab-content {
  @include flex-column;
  gap: $spacing-4;
}

.filters-button-wrapper {
  display: flex;
  justify-content: flex-start;
  margin-bottom: $spacing-4;
}

.has-active-filters {
  border-width: 2px;
}

.filters-menu {
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-4;
  min-width: 320px;
  max-width: 400px;

  @media (max-width: $breakpoint-mobile) {
    min-width: 280px;
    max-width: 90vw;
  }
}

.filter-group {
  @include flex-column;
  gap: $spacing-2;
}

.filter-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-heading;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @include dark-mode {
    color: $color-white;
  }
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: $breakpoint-mobile) {
    flex-wrap: nowrap;
  }
}

.clear-filters-btn {
  align-self: flex-start;
  margin-top: $spacing-2;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}

.users-list {
  @include flex-column;
  gap: $spacing-3;
}

.loading-state {
  @include flex-center;
  padding: $spacing-8;
}

.empty-state {
  @include flex-column;
  @include flex-center;
  gap: $spacing-4;
  padding: $spacing-8;
  text-align: center;
}

.empty-text {
  color: $color-gray-500;
  margin: 0;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
}

.colored-box {
  width: 100%;
  height: 800px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: $radius-xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>

<style lang="scss">
// Non-scoped styles for badge text and background color
.filter-badge.q-badge {
  background-color: #6f00ff !important;

  .q-badge__content,
  .q-badge__content *,
  & > div,
  & > span {
    color: white !important;
  }
}

.filter-badge.q-badge.q-badge--floating {
  background-color: #6f00ff !important;

  .q-badge__content,
  .q-badge__content *,
  & > div,
  & > span {
    color: white !important;
  }
}
</style>
