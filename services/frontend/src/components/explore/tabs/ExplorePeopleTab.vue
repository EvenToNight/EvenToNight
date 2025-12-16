<script setup lang="ts">
import type { SearchResultUser } from '@/api/utils'
import SearchResultCard from '@/components/cards/SearchResultCard.vue'
import { ref } from 'vue'

interface Props {
  people: SearchResultUser[]
  searchQuery: string
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
        <SearchResultCard v-for="result in people" :key="result.id" :result="result" />
      </div>

      <template #loading>
        <div class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>
    <div v-else-if="searchQuery" class="empty-state">
      <q-icon name="people" size="64px" color="grey-5" />
      <p class="empty-text">Nessuna persona trovata</p>
    </div>
    <div v-else class="empty-state">
      <q-icon name="search" size="64px" color="grey-5" />
      <p class="empty-text">Cerca persone per nome</p>
    </div>
    <!-- <EmptyTab v-else :emptyText="emptyText" :emptyIconName="emptyIconName" /> -->
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

.empty-state {
  @include flex-column;
  @include flex-center;
  gap: $spacing-4;
  padding: $spacing-8;
  text-align: center;
}

.empty-text {
  color: $color-gray-500;
  margin: 0;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
}
</style>
