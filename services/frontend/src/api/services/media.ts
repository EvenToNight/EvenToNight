import type { ApiClient } from '../client'
import type { MediaAPI } from '../interfaces/media'
import type { MediaGetResponse, MediaUploadRequest, MediaUploadResponse } from '../interfaces/media'

export const createMediaApi = (_mediaClient: ApiClient): MediaAPI => ({
  async get(_url: string): Promise<MediaGetResponse> {
    return { file: new File([], 'placeholder.jpg') }
  },
  async upload(_request: MediaUploadRequest): Promise<MediaUploadResponse> {
    return { url: 'placeholder.jpg' }
  },
})
