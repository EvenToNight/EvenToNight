<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { QInput } from 'quasar'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'

interface SearchResultEvent {
  type: 'event'
  id: string
  title: string
  location: string
  date: Date
  imageUrl?: string
  relevance: number
}

interface SearchResultUser {
  type: 'organization' | 'member'
  id: string
  name: string
  avatarUrl?: string
  relevance: number
}

type SearchResult = SearchResultEvent | SearchResultUser

interface Props {
  searchQuery?: string
  searchHint?: string
  autofocus?: boolean
  hasFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  searchHint: 'Search...',
  autofocus: false,
  hasFocus: false,
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:hasFocus': [value: boolean]
}>()

const { goToEventDetails, goToUserProfile } = useNavigation()
const showSuggestions = ref(false)
const searchQuery = ref(props.searchQuery)
const inputRef = ref<QInput | null>(null)
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)

let searchTimeout: number | null = null

watch(
  () => props.searchQuery,
  (value) => {
    searchQuery.value = value
  }
)

watch(searchQuery, (value) => emit('update:searchQuery', value))

watch(
  () => props.hasFocus,
  (shouldFocus) => {
    if (shouldFocus && inputRef.value) {
      inputRef.value?.focus()
    } else if (!shouldFocus && inputRef.value) {
      inputRef.value?.blur()
      // Hide suggestions when focus is lost
      showSuggestions.value = false
    }
  }
)

onMounted(() => {
  // Only show suggestions if there's text AND the input has focus
  if (searchQuery.value.length > 0 && props.hasFocus) {
    showSuggestions.value = true
    performSearch()
  }
})

// Calculate relevance score for a text match (0-100)
const calculateRelevance = (query: string, text: string): number => {
  const lowerQuery = query.toLowerCase().trim()
  const lowerText = text.toLowerCase()

  if (!lowerQuery || !lowerText) return 0

  // Exact match = 100
  if (lowerText === lowerQuery) return 100

  // Starts with query = 80
  if (lowerText.startsWith(lowerQuery)) return 80

  // Contains query at word boundary = 60
  const words = lowerText.split(/\s+/)
  if (words.some((word) => word.startsWith(lowerQuery))) return 60

  // Contains query anywhere = 40
  if (lowerText.includes(lowerQuery)) return 40

  // Partial word matches = 20
  if (lowerQuery.length >= 3) {
    for (let i = 0; i <= lowerQuery.length - 3; i++) {
      const substr = lowerQuery.substring(i, i + 3)
      if (lowerText.includes(substr)) return 20
    }
  }

  return 0
}

// Perform debounced search
const performSearch = async () => {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    return
  }

  isSearching.value = true

  try {
    // Call both APIs in parallel
    const [eventsResponse, usersResponse] = await Promise.all([
      api.events.searchByName(query),
      api.users.searchByName(query),
    ])

    const results: SearchResult[] = []

    // Process events
    for (const event of eventsResponse.events) {
      const titleRelevance = calculateRelevance(query, event.title)
      const locationRelevance = calculateRelevance(
        query,
        event.location.name || event.location.city
      )
      const tagsRelevance = Math.max(...event.tags.map((tag) => calculateRelevance(query, tag)), 0)
      const maxRelevance = Math.max(titleRelevance, locationRelevance, tagsRelevance)

      if (maxRelevance > 0) {
        results.push({
          type: 'event',
          id: event.id,
          title: event.title,
          location: event.location.name || event.location.city,
          date: new Date(event.date),
          imageUrl: event.posterLink,
          relevance: maxRelevance,
        })
      }
    }

    // Process users (organizations and members)
    for (const user of usersResponse.users) {
      const nameRelevance = calculateRelevance(query, user.name)
      const bioRelevance = calculateRelevance(query, user.bio || '')
      const maxRelevance = Math.max(nameRelevance, bioRelevance)

      if (maxRelevance > 0) {
        results.push({
          type: user.role,
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          relevance: maxRelevance,
        })
      }
    }

    // Sort by relevance DESC, then by type priority (event > organization > member)
    const typePriority = { event: 3, organization: 2, member: 1 }
    results.sort((a, b) => {
      if (b.relevance !== a.relevance) return b.relevance - a.relevance
      return typePriority[b.type] - typePriority[a.type]
    })

    // Limit to 5 results
    searchResults.value = results.slice(0, 5)
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const handleSearch = () => {
  const firstResult = searchResults.value[0]
  if (firstResult) {
    selectResult(firstResult)
  }
}

const selectResult = (result: SearchResult) => {
  showSuggestions.value = false

  if (result.type === 'event') {
    goToEventDetails(result.id)
  } else {
    goToUserProfile(result.id)
  }
}

const hideSuggestions = () => {
  showSuggestions.value = false
}

const updateQuery = (value: string | number | null) => {
  searchQuery.value = String(value || '')
  showSuggestions.value = searchQuery.value.length > 0

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (searchQuery.value.trim()) {
    searchTimeout = setTimeout(() => {
      performSearch()
    }, 300)
  } else {
    searchResults.value = []
  }
}

// Helper functions
const getResultIcon = (result: SearchResult): string => {
  if (result.type === 'event') return 'event'
  if (result.type === 'organization') return 'business'
  return 'person'
}

const getResultTypeLabel = (result: SearchResult): string => {
  if (result.type === 'event') return 'Event'
  if (result.type === 'organization') return 'Organization'
  return 'Member'
}

const getResultPrimaryText = (result: SearchResult): string => {
  return result.type === 'event' ? result.title : result.name
}

const getResultSecondaryText = (result: SearchResult): string => {
  if (result.type === 'event') {
    return `${result.location} • ${formatDate(result.date)}`
  }
  return ''
}

const formatDate = (date: Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const handleFocus = () => {
  showSuggestions.value = searchQuery.value.length > 0
  emit('update:hasFocus', true)
}

const handleBlur = () => {
  // Add delay to allow click events on results to fire first
  setTimeout(() => {
    hideSuggestions()
    emit('update:hasFocus', false)
  }, 200)
}
</script>

<template>
  <div class="search-bar-wrapper">
    <q-input
      ref="inputRef"
      :model-value="searchQuery"
      dense
      standout
      :placeholder="searchHint"
      :autofocus="autofocus"
      class="search-input"
      @update:model-value="updateQuery"
      @keyup.enter="handleSearch"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #append>
        <q-icon name="search" class="cursor-pointer" @click="handleSearch" />
      </template>
    </q-input>

    <div v-if="showSuggestions && searchResults.length > 0" class="suggestions-dropdown">
      <div
        v-for="result in searchResults"
        :key="`${result.type}-${result.id}`"
        class="suggestion-item"
        @click="selectResult(result)"
      >
        <!-- Show poster for events -->
        <q-avatar v-if="result.type === 'event'" size="32px" class="result-avatar event-avatar">
          <img v-if="result.imageUrl" :src="result.imageUrl" />
          <q-icon v-else :name="getResultIcon(result)" size="20px" />
        </q-avatar>

        <!-- Show avatar for organizations and members -->
        <q-avatar v-if="result.type !== 'event'" size="32px" class="result-avatar">
          <img v-if="result.avatarUrl" :src="result.avatarUrl" />
          <q-icon v-else :name="getResultIcon(result)" size="20px" />
        </q-avatar>

        <div class="result-content">
          <div class="result-primary">{{ getResultPrimaryText(result) }}</div>
          <div class="result-secondary">
            <span class="result-type">{{ getResultTypeLabel(result) }}</span>
            <span v-if="getResultSecondaryText(result)" class="result-detail">
              • {{ getResultSecondaryText(result) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="showSuggestions && isSearching" class="suggestions-dropdown loading">
      <div class="loading-item">
        <q-spinner size="20px" color="primary" />
        <span>Searching...</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-bar-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  min-width: 50px;

  :deep(.q-field__control) {
    border-radius: 8px;

    @include light-mode {
      background-color: white !important;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }

    @include dark-mode {
      background-color: #2c2c2c !important;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
  }

  // Override standout focused state
  :deep(.q-field--standout.q-field--focused .q-field__control) {
    @include light-mode {
      background-color: white !important;
      border-color: $color-primary;
    }

    @include dark-mode {
      background-color: #2c2c2c !important;
      border-color: $color-primary;
    }
  }

  // Keep icon color consistent
  :deep(.q-icon) {
    @include light-mode {
      color: rgba(0, 0, 0, 0.54) !important;
    }

    @include dark-mode {
      color: rgba(255, 255, 255, 0.7) !important;
    }
  }

  // Keep placeholder color consistent
  :deep(.q-field__native::placeholder) {
    @include light-mode {
      color: rgba(0, 0, 0, 0.6) !important;
    }

    @include dark-mode {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  }

  // Override focused state colors
  :deep(.q-field--focused .q-icon),
  :deep(.q-field--focused .q-field__native::placeholder) {
    @include light-mode {
      color: rgba(0, 0, 0, 0.54) !important;
    }

    @include dark-mode {
      color: rgba(255, 255, 255, 0.7) !important;
    }
  }

  // Set cursor and text color
  :deep(.q-field__native) {
    @include light-mode {
      color: black !important;
      caret-color: black !important;
    }

    @include dark-mode {
      color: white !important;
      caret-color: white !important;
    }
  }
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: $shadow-lg;
  overflow: hidden;
  z-index: 1000;

  @include dark-mode {
    background: #2c2c2c;
  }
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  cursor: pointer;
  transition: background-color 0.15s ease;

  @include light-mode {
    color: $color-text-primary;

    &:hover {
      background-color: $color-gray-100;
    }
  }

  @include dark-mode {
    color: $color-text-white;

    &:hover {
      background-color: #3a3a3a;
    }
  }

  .result-avatar {
    flex-shrink: 0;
  }

  .event-avatar {
    border-radius: 6px !important;
  }

  .result-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .result-primary {
    font-size: $font-size-base;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include light-mode {
      color: $color-text-primary;
    }

    @include dark-mode {
      color: $color-text-white;
    }
  }

  .result-secondary {
    font-size: $font-size-xs;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include light-mode {
      color: $color-text-secondary;
    }

    @include dark-mode {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .result-type {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    color: $color-primary;
    flex-shrink: 0;
  }

  .result-detail {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.loading-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-4;

  @include light-mode {
    color: $color-text-secondary;
  }

  @include dark-mode {
    color: rgba(255, 255, 255, 0.6);
  }

  span {
    font-size: $font-size-sm;
  }
}
</style>
