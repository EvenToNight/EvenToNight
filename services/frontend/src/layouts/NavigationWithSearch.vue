<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from 'vue'
import type { SearchResult } from '@/api/utils/searchUtils'
import NavigationBar, { NAVBAR_HEIGHT } from '@/components/navigation/NavigationBar.vue'
import Footer from '@/components/navigation/Footer.vue'
import { useNavigation } from '@/router/utils'

const { goToExplore } = useNavigation()

const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const searchBarHasFocus = ref(false)

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

provide('pageContentSearchBarRef', pageContentSearchBarRef)
provide('searchQuery', searchQuery)
provide('searchResults', searchResults)
provide('searchBarHasFocus', searchBarHasFocus)
provide('showSearchInNavbar', showSearchInNavbar)
provide<(() => void) | undefined>('onSearch', () =>
  goToExplore(searchQuery.value ? { searchQuery: searchQuery.value } : undefined)
)
</script>

<template>
  <div class="navigation-view">
    <div class="scroll-wrapper">
      <NavigationBar :show-search="showSearchInNavbar" />
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
  // min-height: 100vh;
  position: relative;
  min-width: $app-min-width;
}

.scroll-wrapper {
  @include flex-column;
  width: 100%;
  min-height: 100vh;
}

.page-content {
  padding: 0;
  flex: 1;
}
</style>
