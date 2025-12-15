<script setup lang="ts">
import { ref, watch } from 'vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import type { User } from '@/api/types/users'
import EventCardVariant from '@/components/cards/EventCardVariant.vue'
import UserCard from '@/components/cards/UserCard.vue'
import NavigationBar from '@/components/navigation/NavigationBar.vue'
import SearchBar from '@/components/navigation/SearchBar.vue'

const searchQuery = ref('')
const activeTab = ref<'events' | 'organizations' | 'people'>('events')

const events = ref<Event[]>([])
const organizations = ref<User[]>([])
const people = ref<User[]>([])

const loadingEvents = ref(false)
const loadingOrganizations = ref(false)
const loadingPeople = ref(false)

const _hasMoreEvents = ref(false)

const ITEMS_PER_PAGE = 20

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

// Auto-search when searchQuery changes
watch(searchQuery, () => {
  onSearch()
})
</script>

<template>
  <NavigationBar />
  <div class="explore-page">
    <!-- Header Section -->
    <div class="explore-header">
      <h1 class="explore-title">Esplora</h1>
      <p class="explore-subtitle">Trova eventi, organizzatori o connettiti con i tuoi amici</p>

      <!-- Search Bar -->
      <div class="search-container">
        <SearchBar
          v-model:search-query="searchQuery"
          search-hint="Cerca eventi, organizzazioni o persone..."
        />
      </div>

      <!-- Tabs -->
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
  </div>
</template>

<style lang="scss" scoped>
.explore-page {
  @include flex-column;
  min-height: 100vh;
}

.explore-header {
  background: linear-gradient(135deg, #6b46c1 0%, #7c3aed 50%, #8b5cf6 100%);
  @include flex-column;
  align-items: center;
  padding: $spacing-8 $spacing-4 $spacing-6;
  gap: $spacing-4;

  @include dark-mode {
    background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%);
  }
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

.explore-tabs {
  display: flex;
  gap: $spacing-8;
  margin-top: $spacing-4;
}

.explore-tab {
  color: $color-white;
  opacity: 0.7;
  cursor: pointer;
  padding-bottom: $spacing-2;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  user-select: none;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  font-family: $font-family-heading;

  &:hover {
    opacity: 0.9;
  }

  &.active {
    opacity: 1;
    border-bottom-color: $color-white;
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
</style>
