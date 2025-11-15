<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import NavigationBar from '../components/NavigationBar.vue'

const $q = useQuasar()
const showSearchInNavbar = ref(false)
const searchQuery = ref('')
const heroSearchRef = ref<HTMLElement | null>(null)
const heroSearchPlaceholderRef = ref<HTMLElement | null>(null)
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

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return suggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, 5)
})

const toggleDarkMode = () => {
  $q.dark.toggle()
}

const handleScroll = () => {
  const navbarHeight = 64

  if (heroSearchPlaceholderRef.value) {
    const rect = heroSearchPlaceholderRef.value.getBoundingClientRect()
    // Usa sempre la stessa soglia: quando il placeholder passa sotto la navbar
    showSearchInNavbar.value = rect.bottom <= navbarHeight
  }
}

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
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

watch(searchQuery, (newValue) => {
  if (newValue.length > 0 && document.activeElement?.classList.contains('search-input-hero')) {
    showSuggestions.value = true
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="navigation-view">
    <div class="scroll-wrapper">
      <NavigationBar v-model="searchQuery" :show-search="showSearchInNavbar" />
      <div class="page-content">
        <div class="container">
          <h1>Navigation Demo</h1>
          <p>This page demonstrates the Quasar navigation bar.</p>

          <div class="theme-selector">
            <q-btn
              :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              :label="$q.dark.isActive ? 'Light Mode' : 'Dark Mode'"
              color="primary"
              @click="toggleDarkMode"
            />
          </div>
          <!-- Search bar in content (visible when not scrolled) -->
          <div ref="heroSearchPlaceholderRef" class="hero-search">
            <div v-if="!showSearchInNavbar" ref="heroSearchRef" class="hero-search-container">
              <q-input
                v-model="searchQuery"
                dense
                standout
                placeholder="Search..."
                class="search-input-hero"
                @keyup.enter="handleSearch"
                @focus="showSuggestions = searchQuery.length > 0"
                @blur="hideSuggestions"
              >
                <template #append>
                  <q-icon name="search" class="cursor-pointer" @click="handleSearch" />
                </template>
              </q-input>

              <!-- Suggestions dropdown -->
              <div
                v-if="showSuggestions && filteredSuggestions.length > 0"
                class="suggestions-dropdown"
              >
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
          </div>

          <div class="content-section">
            <h4>Welcome to EvenToNight</h4>
            <div class="colored-box"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.scroll-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.page-content {
  padding: $spacing-8 $spacing-4;
  flex: 1;

  @media (max-width: 330px) {
    padding: $spacing-4 $spacing-2;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  h1 {
    margin-bottom: $spacing-4;
  }

  .theme-selector {
    margin-top: $spacing-6;
  }
}

.hero-search {
  margin-bottom: $spacing-8;
  max-width: 600px;
  min-height: 40px; // Mantiene l'altezza della search bar per evitare scatti
  min-width: 20px;
  .hero-search-container {
    position: relative;
  }

  .search-input-hero {
    width: 100%;
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
    z-index: 100;

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
}

.content-section {
  margin-top: $spacing-8;

  h2 {
    margin-top: $spacing-8;
    margin-bottom: $spacing-4;
  }

  h3 {
    margin-top: $spacing-6;
    margin-bottom: $spacing-3;
  }

  .colored-box {
    width: 100%;
    height: 800px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  p {
    margin-bottom: $spacing-4;
    line-height: 1.6;
  }

  ul {
    margin-bottom: $spacing-4;
    padding-left: $spacing-6;

    li {
      margin-bottom: $spacing-2;
      line-height: 1.6;
    }
  }
}
</style>
