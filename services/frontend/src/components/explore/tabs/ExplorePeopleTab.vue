<script setup lang="ts">
import type { SearchResultUser } from '@/api/utils/searchUtils'
import SearchResultCard from '@/components/cards/SearchResultCard.vue'
import { ref } from 'vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import { useNavigation } from '@/router/utils'
import type { SearchResult } from '@/api/utils/searchUtils'

const { goToEventDetails, goToUserProfile } = useNavigation()

interface Props {
  people: SearchResultUser[]
  searchQuery: string
  emptySearchText: string
  emptyText: string
  emptyIconName?: string
  hasMore?: boolean
  onLoadMore?: () => void | Promise<void>
}
const loading = ref(false)
const props = defineProps<Props>()
const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!props.hasMore || !props.onLoadMore) {
    done(true)
    return
  }

  loading.value = true

  try {
    await props.onLoadMore()
  } finally {
    loading.value = false
    done(!props.hasMore)
  }
}
const selectResult = (result: SearchResult) => {
  if (result.type === 'event') {
    goToEventDetails(result.id)
  } else {
    goToUserProfile(result.id)
  }
}
</script>

<template>
  <div class="tab-content">
    <q-infinite-scroll
      v-if="people.length > 0"
      :offset="250"
      class="people-scroll"
      :disable="loading"
      @load="onLoad"
    >
      <div class="users-list">
        <SearchResultCard
          v-for="result in people"
          :key="result.id"
          :result="result"
          @mousedown="selectResult(result)"
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
