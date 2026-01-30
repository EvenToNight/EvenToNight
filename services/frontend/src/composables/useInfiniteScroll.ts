import { ref, computed, type Ref } from 'vue'
import type { PaginatedResponse } from '@/api/interfaces/commons'

interface InfiniteScrollConfiguration<O, R> {
  itemsPerPage?: number
  options?: O
  loadFn: (limit: number, offset: number, options?: O) => Promise<PaginatedResponse<R>>
  onError?: (error: unknown) => void
}

export function useInfiniteScroll<O, R>(config: InfiniteScrollConfiguration<O, R>) {
  const { itemsPerPage = 10, options, loadFn, onError } = config

  const items: Ref<R[]> = ref([])
  const loading = ref(true)
  const loadingMore = ref(false)
  const hasMore = ref(true)

  const isEmpty = computed(() => items.value.length === 0)

  const loadItems = async (isLoadingMore = false) => {
    if (isLoadingMore) {
      loadingMore.value = true
    } else {
      loading.value = true
    }

    try {
      const offset = isLoadingMore ? items.value.length : 0
      const response = await loadFn(itemsPerPage, offset, options)

      if (isLoadingMore) {
        items.value = [...items.value, ...response.items]
      } else {
        items.value = response.items
      }

      hasMore.value = response.hasMore
    } catch (error) {
      if (onError) {
        onError(error)
      } else {
        console.error('Failed to load items:', error)
      }
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
    if (!hasMore.value) {
      done(true)
      return
    }

    try {
      await loadItems(true)
    } finally {
      done(!hasMore.value)
    }
  }

  const reload = () => {
    items.value = []
    hasMore.value = true
    loadItems()
  }

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    isEmpty,
    loadItems,
    onLoad,
    reload,
  }
}
