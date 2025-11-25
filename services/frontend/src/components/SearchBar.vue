<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { QInput } from 'quasar'

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

const showSuggestions = ref(false)
const searchQuery = ref(props.searchQuery)
const inputRef = ref<QInput | null>(null)

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
    }
  }
)

onMounted(() => {
  if (searchQuery.value.length > 0) {
    showSuggestions.value = true
  }
})

const suggestions = [
  'JavaScript tutorials',
  'Vue.js documentation',
  'React vs Vue comparison',
  'TypeScript best practices',
  'CSS Grid layout',
  'Quasar components',
  'Frontend development',
  'Web design trends 2024',
  'Node.js server setup',
  'API integration guide',
]

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return suggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, 5)
})

const handleSearch = () => {
  console.log('Search query:', searchQuery.value)
  // TODO: Implement search logic
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

const hideSuggestions = () => {
  showSuggestions.value = false
}

const updateQuery = (value: string | number | null) => {
  searchQuery.value = String(value || '')
  showSuggestions.value = searchQuery.value.length > 0
}

const handleFocus = () => {
  showSuggestions.value = searchQuery.value.length > 0
  emit('update:hasFocus', true)
}

const handleBlur = () => {
  hideSuggestions()
  emit('update:hasFocus', false)
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

    <div v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions-dropdown">
      <div
        v-for="(suggestion, index) in filteredSuggestions"
        :key="index"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        <q-icon name="search" size="18px" class="suggestion-icon" />
        <span>{{ suggestion }}</span>
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
  gap: $spacing-2;
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

  .suggestion-icon {
    color: $color-gray-400;
  }

  span {
    flex: 1;
    font-size: $font-size-sm;
  }
}
</style>
