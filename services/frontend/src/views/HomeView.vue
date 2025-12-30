<script setup lang="ts">
import { ref } from 'vue'
import NavigationPageView from '@/layouts/NavigationWithSearch.vue'
import HomeViewContent from '@/components/home/HomeViewContent.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'

const showAuthDialog = ref(false)
</script>

<template>
  <div>
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <NavigationPageView>
      <HomeViewContent @auth-required="showAuthDialog = true" />
    </NavigationPageView>
  </div>
</template>
