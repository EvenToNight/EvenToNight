import { ref, onUnmounted, type Ref } from 'vue'
import { api } from '@/api'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
export interface UseImageLoaderReturn {
  imageObjectUrl: Ref<string>
  isLoadingImage: Ref<boolean>
  error: Ref<Error | null>
  loadImage: (url: string) => Promise<void>
  cleanup: () => void
}

export function useImageLoader(): UseImageLoaderReturn {
  const imageObjectUrl = ref<string>('')
  const isLoadingImage = ref(false)
  const error = ref<Error | null>(null)

  const loadImage = async (url: string) => {
    if (!url) {
      logger.warn('useImageLoader: No URL provided')
      return
    }

    isLoadingImage.value = true
    error.value = null

    try {
      const response = await api.media.get(url)
      imageObjectUrl.value = URL.createObjectURL(response.file)
    } catch (err) {
      logger.error('Failed to load image:', err)
      error.value = err as Error
    } finally {
      isLoadingImage.value = false
    }
  }

  const cleanup = () => {
    if (imageObjectUrl.value && imageObjectUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(imageObjectUrl.value)
      imageObjectUrl.value = ''
    }
  }

  onUnmounted(cleanup)

  return {
    imageObjectUrl,
    isLoadingImage,
    error,
    loadImage,
    cleanup,
  }
}
