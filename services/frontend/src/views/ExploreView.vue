<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import NavigationPageView from '@/layouts/NavigationWithSearch.vue'
import ExploreViewContent from '@/components/explore/ExploreViewContent.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import { useTranslation } from '@/composables/useTranslation'

const showAuthDialog = ref(false)
const { t } = useTranslation('views.ExploreView')
provide('searchHint', t('searchHint'))
provide('hideDropdown', true)

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'auto' })
})
</script>

<template>
  <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
  <NavigationPageView>
    <ExploreViewContent @auth-required="showAuthDialog = true" />
  </NavigationPageView>
</template>
