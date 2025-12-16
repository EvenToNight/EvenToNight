<script setup lang="ts">
import { ref, provide } from 'vue'
import NavigationPageView from '@/layouts/NavigationWithSearch.vue'
import ExploreViewContent from '@/components/explore/ExploreViewContent.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'

const showAuthDialog = ref(false)
provide('searchHint', 'Cerca eventi, organizzazioni o persone...')
provide('hideDropdown', true)
</script>

<template>
  <div>
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <NavigationPageView>
      <ExploreViewContent @auth-required="showAuthDialog = true" />
    </NavigationPageView>
  </div>
</template>
