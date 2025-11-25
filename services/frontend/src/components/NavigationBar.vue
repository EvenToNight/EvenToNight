<script lang="ts">
export const NAVBAR_HEIGHT = 64
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SearchBar from './SearchBar.vue'

interface Props {
  showSearch?: boolean
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: false,
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showMobileSearch = ref(false)

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value)
  },
})

const handleSignIn = () => {
  console.log('Sign In clicked')
  // TODO: Implement sign in logic
}

const handleSignUp = () => {
  console.log('Sign Up clicked')
  // TODO: Implement sign up logic
}

const handleSearch = (query: string) => {
  console.log('Search query:', query)
  // TODO: Implement search logic
}

const toggleMobileSearch = () => {
  showMobileSearch.value = !showMobileSearch.value
}
</script>

<template>
  <div class="navbar-wrapper">
    <q-toolbar class="navigation-bar">
      <!-- Mobile search bar (full width) -->
      <div v-if="showMobileSearch" class="mobile-search-bar">
        <div class="mobile-search-container">
          <SearchBar v-model="searchQuery" autofocus @search="handleSearch" />
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
          <SearchBar v-model="searchQuery" @search="handleSearch" />
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
