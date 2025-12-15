import type { MediaAPI, MediaGetResponse } from '../interfaces/media'

const parseUrl = (url: string): string => {
  if (url.startsWith('http://') && !import.meta.env.DEV) {
    return url.replace('http://', 'https://')
  }
  return url
}

export const mediaApi: MediaAPI = {
  async get(url: string): Promise<MediaGetResponse> {
    const response = await fetch(parseUrl(url))
    const blob = await response.blob()
    const filename = url.split('/').pop() || `media-file`
    return { file: new File([blob], filename, { type: blob.type }) }
  },
}
