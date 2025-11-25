<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  autofocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
}>()

const showSuggestions = ref(false)

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

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
    showSuggestions.value = value.length > 0
  },
})

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return suggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, 5)
})

const handleSearch = () => {
  emit('search', searchQuery.value)
  showSuggestions.value = false
}

const selectSuggestion = (suggestion: string) => {
  emit('update:modelValue', suggestion)
  showSuggestions.value = false
  emit('search', suggestion)
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>

<template>
  <div class="search-bar-wrapper">
    <q-input
      v-model="searchQuery"
      dense
      standout
      :placeholder="placeholder"
      :autofocus="autofocus"
      class="search-input"
      @keyup.enter="handleSearch"
      @focus="showSuggestions = searchQuery.length > 0"
      @blur="hideSuggestions"
    >
      <template #append>
        <q-icon name="search" class="cursor-pointer" @click="handleSearch" />
      </template>
    </q-input>

    <!-- Suggestions dropdown -->
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
