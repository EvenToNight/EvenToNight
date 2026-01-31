<script setup lang="ts">
import { ref, watch, computed, inject } from 'vue'
import type { Ref } from 'vue'
import type { UserRole } from '@/api/types/users'
import { searchUsers, type SearchResultUser } from '@/api/utils/searchUtils'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import ExploreEventsTab from '@/components/explore/tabs/ExploreEventsTab.vue'
import ExplorePeopleTab from '@/components/explore/tabs/ExplorePeopleTab.vue'
import type { EventFilters } from './filters/FiltersButton.vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { PaginatedRequest } from '@/api/interfaces/commons'
import { emptyPaginatedResponse } from '@/api/utils/requestUtils'
import { loadEvents } from '@/api/utils/eventUtils'

const { t } = useI18n()
const route = useRoute()

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const emit = defineEmits(['authRequired'])
const authStore = useAuthStore()
const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar', ref(false))
type ExploreTab = 'events' | 'organizations' | 'people'
const activeTab = ref<ExploreTab>('events')

const searchEvents = async (
  _eventFilters: EventFilters | undefined,
  pagination: PaginatedRequest
) => {
  // if (!searchQuery.value.trim() && eventFilters === undefined) {
  //   return emptyPaginatedResponse<EventLoadResult>()
  // }
  //TODO: implement filters in search
  console.log('Searching events with filters:', _eventFilters)
  return loadEvents({
    title: searchQuery.value || undefined,
    userId: authStore.user?.id,
    pagination,
  })
}

watch(searchQuery, () => {
  console.log('Search query changed:', searchQuery.value)
  if (!searchQuery.value.trim()) {
    activeTab.value = 'events'
  }
})

watch(
  () => route.query.search,
  (newSearch) => {
    if (newSearch && typeof newSearch === 'string') {
      searchQuery.value = newSearch.trim()
    } else if (!newSearch) {
      searchQuery.value = ''
    }
  },
  { immediate: true }
)

const searchUsersByRole = async (role: UserRole, pagination: PaginatedRequest) => {
  if (!searchQuery.value.trim()) {
    return emptyPaginatedResponse<SearchResultUser>()
  }
  return searchUsers({ query: searchQuery.value, role, pagination })
}

const tabs = computed<Tab[]>(() => [
  {
    id: 'events',
    label: t('explore.events.title'),
    component: ExploreEventsTab,
    props: {
      searchQuery: searchQuery.value,
      onAuthRequired: () => emit('authRequired'),
      loadFn: searchEvents,
    },
  },
  {
    id: 'organizations',
    label: t('explore.organizations.title'),
    component: ExplorePeopleTab,
    props: {
      searchQuery: searchQuery.value,
      emptySearchText: t('explore.organizations.emptySearchText'),
      emptyText: t('explore.organizations.emptySearch'),
      loadFn: (limit: number, offset: number) =>
        searchUsersByRole('organization', { limit, offset }),
    },
  },
  {
    id: 'people',
    label: t('explore.users.title'),
    component: ExplorePeopleTab,
    props: {
      searchQuery: searchQuery.value,
      emptySearchText: t('explore.users.emptySearchText'),
      emptyText: t('explore.users.emptySearch'),
      loadFn: (limit: number, offset: number) => searchUsersByRole('member', { limit, offset }),
    },
  },
])
</script>

<template>
  <div class="explore-page">
    <div class="explore-hero">
      <div class="explore-header">
        <h1 class="explore-title">{{ t('explore.title') }}</h1>
        <p class="explore-subtitle">{{ t('explore.subtitile') }}</p>
        <div ref="pageContentSearchBarRef" class="search-container">
          <div v-if="!showSearchInNavbar">
            <SearchBar ref="searchBarRef" />
          </div>
        </div>
      </div>
    </div>
    <div
      class="content-wrapper"
      :class="{ 'padded-content': !searchQuery, 'hide-tabs': !searchQuery }"
    >
      <TabView v-model:activeTab="activeTab" :tabs="tabs" :default-tab="'events'" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.explore-page {
  @include flex-column;
}

.explore-hero {
  background: linear-gradient(135deg, #6b46c1 0%, #7c3aed 50%, #8b5cf6 100%);

  @include dark-mode {
    background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%);
  }

  // Rounded corners only when viewport exceeds max-width
  @media (min-width: calc($app-max-width + 1px)) {
    border-radius: 24px;
  }
}

.explore-header {
  @include flex-column;
  align-items: center;
  padding: $spacing-8 $spacing-4 $spacing-6;
  gap: $spacing-4;
}

.explore-title {
  color: $color-white;
  margin: 0;
  text-align: center;
  font-size: 4rem;
  font-weight: 700;
  font-family: $font-family-heading;
  line-height: $line-height-tight;

  @media (max-width: $breakpoint-mobile) {
    font-size: 3rem;
  }
}

.explore-subtitle {
  color: $color-white;
  margin: 0;
  text-align: center;
  opacity: 0.95;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
}

.search-container {
  width: 100%;
  max-width: 600px;
  margin-top: $spacing-4;
}

.content-wrapper {
  @include flex-column;
  width: 100%;
  flex: 1;
}

.padded-content {
  padding: $spacing-4;
}

.hide-tabs {
  :deep(.explore-tab-header) {
    display: none;
  }
}
</style>
