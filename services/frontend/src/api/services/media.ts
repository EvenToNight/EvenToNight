import type { MediaAPI } from '../interfaces/media'
import type {
  MediaGetRequest,
  MediaGetResponse,
  MediaUploadRequest,
  MediaUploadResponse,
} from '../interfaces/media'

export const mediaApi: MediaAPI = {
  async get(_request: MediaGetRequest): Promise<MediaGetResponse> {
    return { file: new File([], 'placeholder.jpg') }
  },
  async upload(_request: MediaUploadRequest): Promise<MediaUploadResponse> {
    return { url: 'placeholder.jpg' }
  },
}
