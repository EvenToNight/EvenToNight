import { ref, computed, type Ref } from 'vue'
import type { PaginatedResponse } from '@/api/interfaces/commons'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
export interface SectionConfig<K extends PropertyKey, O> {
  key: K
  options?: O
}

interface UseMultiSectionInfiniteScrollConfiguration<K extends PropertyKey, O, T> {
  sections: SectionConfig<K, O>[]
  itemsPerPage?: number
  loadFn: (key: K, offset: number, limit: number, options?: O) => Promise<PaginatedResponse<T>>
  onError?: (error: unknown) => void
}

interface SectionData<T> {
  items: T[]
  hasMore: boolean
  loading: boolean
}

export function useMultiSectionInfiniteScroll<K extends PropertyKey, O, T>(
  config: UseMultiSectionInfiniteScrollConfiguration<K, O, T>
) {
  const { sections, itemsPerPage = 10, loadFn, onError } = config

  const sectionsData = ref(
    sections.reduce(
      (acc, section) => {
        acc[section.key] = {
          items: [],
          hasMore: true,
          loading: false,
        }
        return acc
      },
      {} as Record<K, SectionData<T>>
    )
  ) as Ref<Record<K, SectionData<T>>>

  const loading = ref(true)
  const loadingMore = ref(false)
  const currentSectionIndex = ref(0)

  const currentSection = computed(() => sections[currentSectionIndex.value])
  const hasMore = computed(() =>
    sections.some((section) => sectionsData.value[section.key]?.hasMore)
  )
  const allItems = computed(() =>
    sections.flatMap((section) => sectionsData.value[section.key]?.items || [])
  )
  const isEmpty = computed(() => allItems.value.length === 0)

  const getSectionItems = (key: K) => {
    return sectionsData.value[key]?.items || []
  }

  const getSectionConfig = (key: K) => {
    return sections.find((s) => s.key === key)
  }

  const loadMore = async (isLoadingMore = false) => {
    if (isLoadingMore) {
      loadingMore.value = true
    } else {
      loading.value = true
    }

    try {
      const section = currentSection.value
      if (!section) return

      const sectionData = sectionsData.value[section.key]
      if (!sectionData || !sectionData.hasMore) {
        if (currentSectionIndex.value < sections.length - 1) {
          currentSectionIndex.value++
          await loadMore(isLoadingMore)
        }
        return
      }

      const response = await loadFn(
        section.key,
        sectionData.items.length,
        itemsPerPage,
        section.options
      )

      sectionData.items = [...sectionData.items, ...response.items]
      sectionData.hasMore = response.hasMore

      if (!response.hasMore && currentSectionIndex.value < sections.length - 1) {
        currentSectionIndex.value++
      }
    } catch (error) {
      if (onError) {
        onError(error)
      } else {
        logger.error('Failed to load items:', error)
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
      await loadMore(true)
    } finally {
      done(!hasMore.value)
    }
  }

  const reload = () => {
    sections.forEach((section) => {
      const sectionData = sectionsData.value[section.key]
      if (sectionData) {
        sectionData.items = []
        sectionData.hasMore = true
        sectionData.loading = false
      }
    })
    currentSectionIndex.value = 0
    loadMore()
  }

  return {
    sectionsData,
    loading,
    loadingMore,
    hasMore,
    isEmpty,
    allItems,
    getSectionItems,
    getSectionConfig,
    loadMore,
    onLoad,
    reload,
  }
}
