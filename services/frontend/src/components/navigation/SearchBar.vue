<script setup lang="ts">
import { ref, watch, onMounted, inject, type Ref } from 'vue'
import type { QInput } from 'quasar'
import { useNavigation } from '@/router/utils'
import { useI18n } from 'vue-i18n'
import type { SearchResult } from '@/api/utils/searchUtils'
import { getSearchResult } from '@/api/utils/searchUtils'
import SearchResultCard from '../cards/SearchResultCard.vue'

const { t } = useI18n()
const searchHint = inject<string>('searchHint', t('search.baseHint'))
const hideDropdown = inject<boolean>('hideDropdown', false)
const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const searchResults = inject<Ref<SearchResult[]>>('searchResults', ref([]))
const hasFocus = inject<Ref<boolean>>('searchBarHasFocus', ref(false))
const onSearch = inject<(() => void) | undefined>('onSearch', undefined)

const { goToEventDetails, goToUserProfile } = useNavigation()
const showSuggestions = ref(false)
const inputRef = ref<QInput | null>(null)
const isSearching = ref(false)
const maxResults = 5

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (value) => {
  showSuggestions.value = !hideDropdown && value.length > 0

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // Skip internal search if dropdown is hidden (parent handles search)
  if (hideDropdown) {
    return
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
  () => hasFocus.value,
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
  if (searchQuery.value.length > 0 && hasFocus.value && !hideDropdown) {
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
  if (onSearch) {
    onSearch()
    return
  }
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
  showSuggestions.value = !hideDropdown && searchQuery.value.length > 0
  hasFocus.value = true
}

const handleBlur = () => {
  hideSuggestions()
  hasFocus.value = false
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
      :autofocus="hasFocus"
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
        <SearchResultCard
          v-for="result in searchResults"
          :key="`${result.type}-${result.id}`"
          :result="result"
          @mousedown="selectResult(result)"
        />
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showSuggestions && isSearching" class="suggestions-dropdown loading">
        <div class="loading-item">
          <q-spinner size="20px" color="primary" />
          <span>{{ t('search.searchingText') }}</span>
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
    border-radius: $radius-lg;
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
