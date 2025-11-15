<template>
  <q-toolbar class="navigation-bar">
    <q-toolbar-title class="brand-title">
      <router-link to="/" class="brand-link"> EvenToNight </router-link>
    </q-toolbar-title>

    <q-space />

    <!-- Search bar centered -->
    <div class="search-container">
      <q-input
        v-model="searchQuery"
        dense
        standout
        placeholder="Search..."
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <q-icon name="search" class="cursor-pointer" @click="handleSearch" />
        </template>
      </q-input>
    </div>

    <q-space />

    <!-- Auth buttons -->
    <div class="auth-buttons">
      <q-btn flat label="Sign In" class="q-mr-sm" color="primary" @click="handleSignIn" />
      <q-btn unelevated label="Sign Up" color="primary" @click="handleSignUp" />
    </div>
  </q-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavigationBar',
  data() {
    return {
      searchQuery: '',
    }
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
  },
})
</script>

<style lang="scss">
.navigation-bar {
  min-width: 300px !important;
  width: 100% !important;
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
    min-width: 300px !important;
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
}

.search-input {
  width: 100%;
  min-width: 50px;
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
}
</style>
