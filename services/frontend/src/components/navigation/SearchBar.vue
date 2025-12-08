<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { QInput } from 'quasar'
import { useNavigation } from '@/router/utils'
import type { SearchResult } from '@/api/utils'
import { getSearchResult } from '@/api/utils'

interface Props {
  searchQuery?: string
  searchResults?: SearchResult[]
  searchHint?: string
  autofocus?: boolean
  hasFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  searchResults: () => [],
  searchHint: 'Search...',
  autofocus: false,
  hasFocus: false,
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:searchResults': [value: SearchResult[]]
  'update:hasFocus': [value: boolean]
}>()

const { goToEventDetails, goToUserProfile, locale } = useNavigation()
const showSuggestions = ref(false)
const inputRef = ref<QInput | null>(null)
const isSearching = ref(false)
const maxResults = 5

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit('update:searchQuery', value),
})

const searchResults = computed({
  get: () => props.searchResults,
  set: (value) => emit('update:searchResults', value),
})

let searchDebounceTimer: number | null = null

watch(searchQuery, (value) => {
  showSuggestions.value = value.length > 0

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  if (value.trim()) {
    searchDebounceTimer = setTimeout(() => {
      performSearch()
    }, 300)
  } else {
    searchResults.value = []
  }
})

watch(
  () => props.hasFocus,
  (shouldFocus) => {
    if (!inputRef.value) return
    if (shouldFocus) {
      inputRef.value.focus()
    } else {
      inputRef.value.blur()
      showSuggestions.value = false
    }
  }
)

onMounted(() => {
  if (searchQuery.value.length > 0 && props.hasFocus) {
    showSuggestions.value = true
    performSearch()
  }
})

const performSearch = async () => {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    return
  }

  try {
    isSearching.value = true
    searchResults.value = await getSearchResult(query, maxResults)
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const handleSearch = () => {
  // TODO improve on Enter key press during search behavior
  const firstResult = searchResults.value[0]
  if (firstResult) {
    selectResult(firstResult)
  }
}

const selectResult = (result: SearchResult) => {
  hideSuggestions()
  if (result.type === 'event') {
    goToEventDetails(result.id)
  } else {
    goToUserProfile(result.id)
  }
}

const hideSuggestions = () => {
  showSuggestions.value = false
}

const handleFocus = () => {
  showSuggestions.value = searchQuery.value.length > 0
  emit('update:hasFocus', true)
}

const handleBlur = () => {
  hideSuggestions()
  emit('update:hasFocus', false)
}

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
  return date.toLocaleDateString(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="search-bar-wrapper">
    <q-input
      ref="inputRef"
      v-model="searchQuery"
      dense
      standout
      :placeholder="searchHint"
      :autofocus="autofocus"
      class="search-input"
      @keyup.enter="handleSearch"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #append>
        <q-icon name="search" class="cursor-pointer" @click="handleSearch" />
      </template>
    </q-input>

    <Transition name="fade">
      <div v-if="showSuggestions && searchResults.length > 0" class="suggestions-dropdown">
        <div
          v-for="result in searchResults"
          :key="`${result.type}-${result.id}`"
          class="suggestion-item"
          @mousedown="selectResult(result)"
        >
          <q-avatar
            size="32px"
            class="result-avatar"
            :class="{ 'event-avatar': result.type === 'event' }"
          >
            <img
              v-if="result.type === 'event' ? result.imageUrl : result.avatarUrl"
              :src="result.type === 'event' ? result.imageUrl : result.avatarUrl"
            />
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
    </Transition>

    <Transition name="fade">
      <div v-if="showSuggestions && isSearching" class="suggestions-dropdown loading">
        <div class="loading-item">
          <q-spinner size="20px" color="primary" />
          <span>Searching...</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.search-bar-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  min-width: 50px;

  :deep(.q-field__control) {
    border-radius: 8px;
    background-color: $color-white;
    border: 1px solid $color-border;

    @include dark-mode {
      background-color: $color-background-dark;
      border: 1px solid $color-border-dark;
    }
  }

  :deep(.q-field__native),
  :deep(.q-icon) {
    color: $color-black;
    caret-color: $color-black;

    @include dark-mode {
      color: $color-white;
      caret-color: $color-white;
    }
  }
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
  z-index: $z-index-dropdown;

  @include dark-mode {
    background: $color-background-dark;
    border: 1px solid $color-border-dark;
  }
}

.suggestion-item {
  @include flex-center;
  gap: $spacing-3;
  padding: $spacing-3;
  cursor: pointer;
  transition: background-color $transition-fast;
  color: $color-text-primary;
  &:hover {
    background-color: $color-gray-100;
  }

  @include dark-mode {
    color: $color-text-white;

    &:hover {
      background-color: $color-gray-hover;
    }
  }

  .result-avatar {
    flex-shrink: 0;
  }

  .event-avatar {
    border-radius: $radius-md;
  }

  .result-content {
    @include flex-column;
    flex: 1;
    min-width: 0;
    gap: $spacing-1;
  }

  .result-primary {
    @include text-truncate;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;

    @include dark-mode {
      color: $color-text-white;
    }
  }

  .result-secondary {
    @include text-truncate;
    font-size: $font-size-xs;
    gap: $spacing-1;
    color: $color-text-secondary;

    @include dark-mode {
      color: $color-text-dark;
    }
  }

  .result-type {
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    font-size: $font-size-xs;
    letter-spacing: 0.5px;
    color: $color-primary;
  }

  .result-detail {
    @include text-truncate;
  }
}

.loading-item {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-4;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }

  span {
    font-size: $font-size-sm;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-fast;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
