<script setup lang="ts">
import { ref, watch, onMounted, inject, type Ref } from 'vue'
import type { QInput } from 'quasar'
import { useNavigation } from '@/router/utils'
import type { SearchResult } from '@/api/utils/searchUtils'
import { getSearchResult } from '@/api/utils/searchUtils'
import SearchResultCard from '../cards/SearchResultCard.vue'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

const { t } = useTranslation('components.navigation.SearchBar')
const logger = createLogger(import.meta.url)
const searchHint = inject<string>('searchHint', t('baseHint'))
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
const selectedIndex = ref(-1)

watch(searchQuery, (value) => {
  showSuggestions.value = !hideDropdown && value.length > 0
  selectedIndex.value = -1

  // Skip internal search if dropdown is hidden (parent handles search)
  if (hideDropdown) {
    return
  }

  if (value.trim()) {
    performSearch()
  } else {
    searchResults.value = []
  }
})

watch(searchResults, () => {
  selectedIndex.value = -1
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
    logger.error('Search failed:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const handleSearch = () => {
  if (selectedIndex.value < 0 && onSearch) {
    onSearch()
    return
  }

  const selectedResult =
    selectedIndex.value >= 0 ? searchResults.value[selectedIndex.value] : undefined
  if (selectedResult) {
    selectResult(selectedResult)
  } else if (searchResults.value.length > 0) {
    const firstResult = searchResults.value[0]
    if (firstResult) {
      selectResult(firstResult)
    }
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

const handleArrowDown = () => {
  if (searchResults.value.length === 0) return
  selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
}

const handleArrowUp = () => {
  if (searchResults.value.length === 0) return
  selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
}

const hideSuggestions = () => {
  showSuggestions.value = false
  selectedIndex.value = -1
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

<!-- eslint-disable vuejs-accessibility/no-autofocus -->
<template>
  <div class="search-bar-wrapper">
    <q-input
      ref="inputRef"
      v-model="searchQuery"
      dense
      standout
      :debounce="300"
      :placeholder="searchHint"
      :autofocus="hasFocus"
      class="search-input"
      @keyup.enter="handleSearch"
      @keydown.down.prevent="handleArrowDown"
      @keydown.up.prevent="handleArrowUp"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #append>
        <q-icon name="search" class="cursor-pointer" @click="handleSearch" />
      </template>
    </q-input>

    <Transition name="fade">
      <div
        v-if="showSuggestions && !isSearching && searchResults.length > 0"
        class="suggestions-dropdown"
      >
        <SearchResultCard
          v-for="(result, index) in searchResults"
          :key="`${result.type}-${result.id}`"
          :result="result"
          :is-selected="index === selectedIndex"
          @mousedown="selectResult(result)"
        />
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showSuggestions && isSearching" class="suggestions-dropdown loading">
        <div class="loading-item">
          <q-spinner size="20px" color="primary" />
          <span>{{ t('searchingText') }}</span>
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
