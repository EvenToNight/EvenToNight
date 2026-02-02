<script setup lang="ts">
import SearchResultCard from '@/components/cards/SearchResultCard.vue'
import { watch, onMounted } from 'vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import { useNavigation } from '@/router/utils'
import type { SearchResultUser } from '@/api/utils/searchUtils'
import type { PaginatedResponse } from '@/api/interfaces/commons'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { defaultLimit } from '@/api/utils/requestUtils'

const { goToUserProfile } = useNavigation()

interface Props {
  searchQuery: string
  emptySearchText: string
  emptyText: string
  emptyIconName?: string
  loadFn: (limit: number, offset: number) => Promise<PaginatedResponse<SearchResultUser>>
}

const props = defineProps<Props>()

const {
  items: people,
  //loading,
  loadingMore,
  onLoad,
  loadItems,
  reload,
} = useInfiniteScroll<SearchResultUser>({
  itemsPerPage: defaultLimit,
  loadFn: async (limit, offset) => {
    return props.loadFn(limit, offset)
  },
})

onMounted(() => {
  loadItems()
})

watch(
  () => props.searchQuery,
  () => {
    reload()
  }
)
</script>

<template>
  <div class="tab-content">
    <q-infinite-scroll
      v-if="people.length > 0"
      :offset="250"
      class="people-scroll"
      :disable="loadingMore"
      @load="onLoad"
    >
      <div class="users-list">
        <SearchResultCard
          v-for="result in people"
          :key="result.id"
          :result="result"
          @mousedown="goToUserProfile(result.id)"
        />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>
    <EmptyTab
      v-else-if="searchQuery"
      :emptyText="emptyText"
      :emptyIconName="emptyIconName || 'search'"
    />
    <EmptyTab v-else :emptyText="emptySearchText" :emptyIconName="emptyIconName || 'search'" />
  </div>
</template>

<style lang="scss" scoped>
.tab-content {
  @include flex-column;
  gap: $spacing-4;
}

.people-scroll {
  height: 100%;
}

.users-list {
  @include flex-column;
  gap: $spacing-3;
}

.loading-state {
  @include flex-center;
  padding: $spacing-8;
}
</style>
