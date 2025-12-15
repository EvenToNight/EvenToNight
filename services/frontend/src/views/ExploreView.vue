<script setup lang="ts">
import { ref } from 'vue'
import NavigationPageView from '@/layouts/NavigationWithSearch.vue'
import ExploreViewContent from '@/components/explore/ExploreViewContent.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'

const showAuthDialog = ref(false)
</script>

<template>
  <div>
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <NavigationPageView :hide-dropdown="true">
      <ExploreViewContent @auth-required="showAuthDialog = true" />
    </NavigationPageView>
  </div>
</template>
