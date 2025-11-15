<script setup lang="ts">
// Navigation bar component using Quasar
</script>

<template>
  <div class="navigation-bar bg-dark text-white">
    <q-toolbar class="nav-toolbar">
      <!-- Logo/Brand on the left -->
      <q-toolbar-title class="brand-title">
        <router-link to="/" class="brand-link"> EvenToNight </router-link>
      </q-toolbar-title>

      <!-- Spacer to push buttons to the right -->
      <q-space />

      <!-- Sign In / Sign Up buttons on the right -->
      <div class="auth-buttons">
        <q-btn
          flat
          label="Sign In"
          class="q-mr-sm sign-in-btn"
          text-color="white"
          @click="handleSignIn"
        />

        <q-btn
          unelevated
          label="Sign Up"
          color="secondary"
          class="sign-up-btn"
          @click="handleSignUp"
        />
      </div>
    </q-toolbar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavigationBar',
  methods: {
    handleSignIn() {
      console.log('Sign In clicked')
      // TODO: Implement sign in logic
    },
    handleSignUp() {
      console.log('Sign Up clicked')
      // TODO: Implement sign up logic
    },
  },
})
</script>

<style lang="scss" scoped>
.navigation-bar {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  min-width: 700px;
  box-shadow: $shadow-md;
}

:deep(.nav-toolbar) {
  align-items: center;
  min-height: 64px;
  min-width: 700px;
  background-color: $color-gray-900;
}

.brand-link {
  text-decoration: none;
  color: inherit;
  font-weight: 600;
  font-size: 1.25rem;
  transition: opacity $transition-base;
  white-space: nowrap; // Previene il wrapping del testo

  &:hover {
    opacity: 0.8;
  }
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  white-space: nowrap; // Previene il wrapping dei bottoni
}

:deep(.sign-in-btn) {
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

:deep(.sign-up-btn) {
  font-weight: 600;
  padding: 0 1.5rem;

  &:hover {
    opacity: 0.9;
  }
}
</style>
