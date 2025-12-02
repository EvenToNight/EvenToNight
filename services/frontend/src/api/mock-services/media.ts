import type { MediaAPI } from '../interfaces/media'
import type { MediaGetResponse, MediaUploadRequest, MediaUploadResponse } from '../interfaces/media'

const delay = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms))

const imageModules = import.meta.glob('/public/images/*.{jpg,jpeg,png,gif,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const DEFAULT_IMAGES: Record<string, string> = Object.entries(imageModules).reduce(
  (acc, [path, url]) => {
    const filename = path
      .replace('/public/images/', '')
      .replace(/\.[^.]+$/, '')
      .trim()
    acc[filename] = url as string
    return acc
  },
  {} as Record<string, string>
)

const getImageFromStorage = async (url: string): Promise<MediaGetResponse> => {
  const image = localStorage.getItem(url)
  if (image) {
    const parsed = JSON.parse(image) as MediaUploadRequest
    return { file: parsed.file }
  } else {
    const fileName = url.split('/').pop() || ''
    const imageKey = url
      .replace('media/', '')
      .replace(/\.[^.]+$/, '')
      .trim()

    let imageUrl = DEFAULT_IMAGES[imageKey]

    if (!imageUrl) {
      const imageType = url.split('/')[1]
      if (imageType === 'events' || imageType === 'users') {
        imageUrl = DEFAULT_IMAGES[`default-${imageType}`]
      } else {
        imageUrl = DEFAULT_IMAGES['default']
      }
    }

    const response = await fetch(imageUrl!)
    const blob = await response.blob()
    return { file: new File([blob], fileName, { type: blob.type }) }
  }
}

const saveImageToStorage = (image: MediaUploadRequest): MediaUploadResponse => {
  const key = `media/${image.type}/${image.entityId}/${image.file.name}`
  localStorage.setItem(key, JSON.stringify(image))
  return { url: key }
}

export const mockMediaApi: MediaAPI = {
  async get(url: string): Promise<MediaGetResponse> {
    await delay()
    return getImageFromStorage(url)
  },
  async upload(request: MediaUploadRequest): Promise<MediaUploadResponse> {
    await delay()
    return saveImageToStorage(request)
  },
}
