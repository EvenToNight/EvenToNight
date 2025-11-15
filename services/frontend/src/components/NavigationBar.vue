<template>
  <div class="navbar-wrapper">
    <q-toolbar class="navigation-bar">
      <!-- Mobile search bar (full width) -->
      <div v-if="showMobileSearch" class="mobile-search-bar">
        <div class="mobile-search-container">
          <q-input
            v-model="searchQuery"
            dense
            standout
            placeholder="Search..."
            class="search-input"
            autofocus
            @keyup.enter="handleSearch"
            @focus="showSuggestions = searchQuery.length > 0"
            @blur="hideSuggestions"
          >
            <template #append>
              <q-icon name="search" class="cursor-pointer" @click="handleSearch" />
            </template>
          </q-input>

          <!-- Suggestions dropdown for mobile -->
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
        <q-btn flat dense icon="close" @click="toggleMobileSearch" />
      </div>

      <!-- Normal navbar -->
      <template v-else>
        <q-toolbar-title class="brand-title">
          <router-link to="/" class="brand-link"> EvenToNight </router-link>
        </q-toolbar-title>

        <q-space />

        <!-- Search bar centered (only shown when showSearch is true) -->
        <div v-if="showSearch" class="search-container">
          <q-input
            v-model="searchQuery"
            dense
            standout
            placeholder="Search..."
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

        <q-space v-if="showSearch" class="desktop-space" />

        <!-- Search icon only (mobile) - shown when showSearch is true -->
        <q-btn
          v-if="showSearch"
          flat
          dense
          icon="search"
          class="search-icon-mobile"
          @click="toggleMobileSearch"
        />

        <!-- Auth buttons -->
        <div class="auth-buttons">
          <q-btn
            flat
            label="Sign In"
            class="q-mr-sm sign-in-btn"
            color="primary"
            @click="handleSignIn"
          />
          <q-btn unelevated label="Sign Up" color="primary" @click="handleSignUp" />
        </div>
      </template>
    </q-toolbar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavigationBar',
  props: {
    showSearch: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showMobileSearch: false,
      showSuggestions: false,
      suggestions: [
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
      ],
    }
  },
  computed: {
    searchQuery: {
      get(): string {
        return this.modelValue
      },
      set(value: string) {
        this.$emit('update:modelValue', value)
        this.showSuggestions = value.length > 0
      },
    },
    filteredSuggestions(): string[] {
      if (!this.searchQuery) return []
      const query = this.searchQuery.toLowerCase()
      return this.suggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, 5)
    },
  },
  methods: {
    handleSignIn() {
      console.log('Sign In clicked')
      // TODO: Implement sign in logic
    },
    handleSignUp() {
      console.log('Sign Up clicked')
      // TODO: Implement sign up logic
    },
    handleSearch() {
      console.log('Search query:', this.searchQuery)
      // TODO: Implement search logic
    },
    toggleMobileSearch() {
      this.showMobileSearch = !this.showMobileSearch
    },
    selectSuggestion(suggestion: string) {
      this.$emit('update:modelValue', suggestion)
      this.showSuggestions = false
      this.handleSearch()
    },
    hideSuggestions() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },
  },
})
</script>

<style lang="scss">
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  min-width: 300px;
  width: 100%;
}

.navigation-bar {
  min-width: 300px;
  width: 100%;
  min-height: 64px;
  transition: background-color 0.3s ease;

  @include light-mode {
    background-color: white !important;
  }

  @include dark-mode {
    background-color: #1d1d1d !important;
  }

  // Force min-width on internal q-toolbar
  .q-toolbar {
    min-width: 300px;
    width: 100%;
  }
}

.brand-title {
  flex: 0 1 auto;
  margin-right: $spacing-2;
  min-width: 0;
}

.brand-link {
  text-decoration: none;
  color: $color-primary !important;
  font-weight: 600;
  transition: opacity $transition-base;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

  &:hover {
    opacity: 0.8;
  }
}

.search-container {
  flex: 1 1 auto;
  max-width: 500px;
  min-width: 0;
  margin: 0 $spacing-2;
  position: relative;

  @media (max-width: 800px) {
    display: none;
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

.search-input {
  width: 100%;
  min-width: 50px;
}

.search-icon-mobile {
  display: none;

  @media (max-width: 800px) {
    display: inline-flex;
  }
}

.desktop-space {
  @media (max-width: 800px) {
    display: none;
  }
}

.auth-buttons {
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  gap: $spacing-1;
  white-space: nowrap;
  min-width: 0;

  .q-btn {
    min-width: 60px;
    padding: 0 8px;
  }

  .sign-in-btn {
    @media (max-width: 800px) {
      display: none;
    }
  }
}

.mobile-search-bar {
  display: flex;
  align-items: flex-start;
  gap: $spacing-2;
  width: 100%;

  .mobile-search-container {
    flex: 1;
    position: relative;
    width: 100%;
  }
}
</style>
