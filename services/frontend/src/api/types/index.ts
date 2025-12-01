// Common types
export type { ApiError } from './common'

// Service-specific types
export type { GetTagResponse } from './events'

export type {
  MediaGetRequest as ImageGetRequest,
  MediaGetResponse as ImageGetResponse,
  MediaUploadRequest as ImageUploadRequest,
  MediaUploadResponse as ImageUploadResponse,
} from './media'
