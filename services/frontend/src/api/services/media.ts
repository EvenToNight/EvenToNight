import type { MediaAPI, MediaGetResponse } from '../interfaces/media'

export const mediaApi: MediaAPI = {
  async get(url: string): Promise<MediaGetResponse> {
    const response = await fetch(url)
    const blob = await response.blob()
    const filename = url.split('/').pop() || `media-file`
    return { file: new File([blob], filename, { type: blob.type }) }
  },
}
