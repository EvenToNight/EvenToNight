import type { ApiClient } from '../client'
import type { MediaAPI, MediaGetResponse } from '../interfaces/media'

export const createMediaApi = (mediaClient: ApiClient): MediaAPI => ({
  async get(url: string): Promise<MediaGetResponse> {
    return mediaClient.get<MediaGetResponse>(url)
  },
})
