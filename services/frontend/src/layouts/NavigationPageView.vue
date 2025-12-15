<script setup lang="ts">
import { ref, provide } from 'vue'
import type { SearchResult } from '@/api/utils'
import NavigationBar from '@/components/navigation/NavigationBar.vue'
import Footer from '@/components/navigation/Footer.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import { onMounted, onUnmounted } from 'vue'
import { NAVBAR_HEIGHT } from '../components/navigation/NavigationBar.vue'

const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const searchBarHasFocus = ref(false)
const showAuthDialog = ref(false)
const pageContentSearchBarRef = ref<HTMLElement | null>(null)
const showSearchInNavbar = ref(false)

const handleScroll = () => {
  if (pageContentSearchBarRef.value) {
    const rect = pageContentSearchBarRef.value.getBoundingClientRect()
    showSearchInNavbar.value = rect.bottom <= NAVBAR_HEIGHT
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Provide state to be used by the page content
provide('pageContentSearchBarRef', pageContentSearchBarRef)
provide('searchQuery', searchQuery)
provide('searchResults', searchResults)
provide('searchBarHasFocus', searchBarHasFocus)
provide('showAuthDialog', showAuthDialog)
provide('showSearchInNavbar', showSearchInNavbar)
</script>

<template>
  <div class="navigation-view">
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />

    <div class="scroll-wrapper">
      <NavigationBar
        v-model:search-query="searchQuery"
        v-model:search-results="searchResults"
        v-model:has-focus="searchBarHasFocus"
        :show-search="showSearchInNavbar"
      />
      <div class="page-content">
        <slot></slot>
      </div>
      <Footer />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-view {
  @include flex-column;
  min-height: 100vh;
  position: relative;
  min-width: 300px;
}

.scroll-wrapper {
  @include flex-column;
  width: 100%;
}

.page-content {
  padding: 0;
  flex: 1;
}
</style>
