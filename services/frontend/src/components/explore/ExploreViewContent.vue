<script setup lang="ts">
import { ref, watch, computed, inject } from 'vue'
import type { Ref } from 'vue'
import type { UserRole } from '@/api/types/users'
import {
  convertFiltersToEventsQueryParams,
  searchUsers,
  type SearchResultUser,
} from '@/api/utils/searchUtils'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import ExploreEventsTab from '@/components/explore/tabs/ExploreEventsTab.vue'
import ExplorePeopleTab from '@/components/explore/tabs/ExplorePeopleTab.vue'
import type { EventFilters } from './filters/FiltersButton.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useRoute } from 'vue-router'
import type { PaginatedRequest } from '@/api/interfaces/commons'
import { emptyPaginatedResponse } from '@/api/utils/requestUtils'
import { loadEvents } from '@/api/utils/eventUtils'
import { useNavigation } from '@/router/utils'
import { createLogger } from '@/utils/logger'
import type { EventsQueryParams } from '@/api/interfaces/events'

const { t } = useTranslation('components.explore.ExploreViewContent')
const route = useRoute()
const logger = createLogger(import.meta.url)

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const emit = defineEmits(['authRequired'])
const authStore = useAuthStore()
const { hash, replaceRoute } = useNavigation()
const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar', ref(false))
type ExploreTab = 'events' | 'organizations' | 'people'
const activeTab = ref<ExploreTab>('events')
const lastActiveTab = ref<ExploreTab>(activeTab.value)

const searchEvents = async (
  eventFilters: EventFilters | undefined,
  pagination: PaginatedRequest
) => {
  logger.log('Searching events with filters:', eventFilters)
  const params: EventsQueryParams = eventFilters
    ? await convertFiltersToEventsQueryParams(eventFilters)
    : {}
  return loadEvents({
    title: searchQuery.value || undefined,
    userId: authStore.user?.id,
    status: new Set(['PUBLISHED', 'COMPLETED', 'CANCELLED']),
    pagination,
    ...params,
  })
}

watch(
  () => hash.value,
  (newHash) => {
    if (newHash) {
      activeTab.value = newHash.replace('#', '') as ExploreTab
    }
  }
)

watch(activeTab, (newTab) => {
  if (hash.value !== `#${newTab}`) {
    replaceRoute({ hash: `#${newTab}` })
  }
})

watch(searchQuery, () => {
  logger.log('Search query changed:', searchQuery.value)
  if (!searchQuery.value.trim()) {
    lastActiveTab.value = activeTab.value
    activeTab.value = 'events'
  } else {
    activeTab.value = lastActiveTab.value
  }
})

watch(
  () => route.query.search,
  (newSearch) => {
    if (newSearch && typeof newSearch === 'string') {
      logger.log('Route search query changed:', newSearch)
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
    label: t('eventsTabTitle'),
    component: ExploreEventsTab,
    props: {
      searchQuery: searchQuery.value,
      onAuthRequired: () => emit('authRequired'),
      loadFn: searchEvents,
    },
  },
  {
    id: 'organizations',
    label: t('organizationsTabTitle'),
    component: ExplorePeopleTab,
    props: {
      searchQuery: searchQuery.value,
      emptySearchText: t('organizationEmptySearchText'),
      emptyText: t('organizationEmptySearch'),
      loadFn: (limit: number, offset: number) =>
        searchUsersByRole('organization', { limit, offset }),
    },
  },
  {
    id: 'people',
    label: t('usersTabTitle'),
    component: ExplorePeopleTab,
    props: {
      searchQuery: searchQuery.value,
      emptySearchText: t('usersEmptySearchText'),
      emptyText: t('usersEmptySearch'),
      loadFn: (limit: number, offset: number) => searchUsersByRole('member', { limit, offset }),
    },
  },
])
</script>

<template>
  <div class="explore-page">
    <div class="explore-hero">
      <div class="explore-header">
        <h1 class="explore-title">{{ t('title') }}</h1>
        <p class="explore-subtitle">{{ t('subtitle') }}</p>
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
  flex: 1;
  background-color: $grey-2;
  @include dark-mode {
    background-color: $grey-10;
  }
}

.explore-hero {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-light 100%);

  @include dark-mode {
    background: linear-gradient(135deg, $color-primary-dark 0%, $color-primary 100%);
  }

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
