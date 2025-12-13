import type { ApiClient } from '../client'
import type { MediaAPI, MediaGetResponse } from '../interfaces/media'

export const createMediaApi = (mediaClient: ApiClient): MediaAPI => ({
  async get(url: string): Promise<MediaGetResponse> {
    const file = await mediaClient.getFile(url)
    return { file }
  },
  buildLink(url: string): string {
    return mediaClient.baseUrl + '/' + url
  },
})
