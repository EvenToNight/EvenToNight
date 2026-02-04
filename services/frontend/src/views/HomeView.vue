<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import NavigationPageView from '@/layouts/NavigationWithSearch.vue'
import HomeViewContent from '@/components/home/HomeViewContent.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import { useTranslation } from '@/composables/useTranslation'

const showAuthDialog = ref(false)
const { t } = useTranslation('views.ExploreView')
provide(
  'searchHint',
  computed(() => t('searchHint'))
)
</script>

<template>
  <div>
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <NavigationPageView>
      <HomeViewContent @auth-required="showAuthDialog = true" />
    </NavigationPageView>
  </div>
</template>
