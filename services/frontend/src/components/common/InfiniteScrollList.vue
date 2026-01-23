<script setup lang="ts" generic="T">
import { ref, onMounted } from 'vue'
import EmptyState from '@/components/navigation/tabs/EmptyTab.vue'
import type { PaginatedResponse } from '@/api/interfaces/commons'

const ITEMS_PER_PAGE = 10

interface Props {
  emptyText?: string
  emptyIconName?: string
  loadItems: (offset: number, limit: number) => Promise<PaginatedResponse<T>>
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: 'Non è stato trovato nessun risultato.',
  emptyIconName: 'search_off',
  itemsPerPage: ITEMS_PER_PAGE,
})

const items = defineModel<T[]>({ default: [] })

const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)

const loadData = async (isLoadingMore = false) => {
  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const response = await props.loadItems(
      isLoadingMore ? items.value.length : 0,
      props.itemsPerPage!
    )

    if (isLoadingMore) {
      items.value = [...items.value, ...response.items]
    } else {
      items.value = response.items
    }

    hasMore.value = response.hasMore
  } catch (error) {
    console.error('Failed to load items:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

onMounted(() => {
  loadData()
})

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!hasMore.value) {
    done(true)
    return
  }

  try {
    await loadData(true)
  } finally {
    done(!hasMore.value)
  }
}

// Esponi solo reload (items è già accessibile tramite v-model)
defineExpose({
  reload: () => loadData(),
})
</script>

<template>
  <div class="infinite-scroll-container">
    <q-inner-loading :showing="loading && items.length === 0">
      <q-spinner-dots color="primary" size="50px" />
    </q-inner-loading>

    <q-infinite-scroll
      v-if="!loading && items.length > 0"
      :offset="250"
      :disable="loadingMore || !hasMore"
      @load="onLoad"
    >
      <slot :items="items" />

      <template #loading>
        <div class="loading-state">
          <q-spinner-dots color="primary" size="50px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyState
      v-else-if="!loading && items.length === 0"
      :empty-icon-name="emptyIconName"
      :empty-text="emptyText"
      class="empty-state"
    />
  </div>
</template>

<style lang="scss" scoped>
.infinite-scroll-container {
  min-height: 400px;
  position: relative;
  padding: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-8;
}

.empty-state {
  padding: $spacing-8 0;
}
</style>
