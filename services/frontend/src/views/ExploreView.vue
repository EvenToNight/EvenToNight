<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import NavigationPageView from '@/layouts/NavigationWithSearch.vue'
import ExploreViewContent from '@/components/explore/ExploreViewContent.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'

const showAuthDialog = ref(false)
provide('searchHint', 'Cerca eventi, organizzazioni o persone...')
provide('hideDropdown', true)

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'auto' })
})
</script>

<template>
  <div>
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <NavigationPageView>
      <ExploreViewContent @auth-required="showAuthDialog = true" />
    </NavigationPageView>
  </div>
</template>
