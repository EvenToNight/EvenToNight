export interface MediaGetRequest {
  url: string
}

export interface MediaGetResponse {
  file: File
}

export interface MediaUploadRequest {
  file: File
  type: 'events' | 'users'
  entityId: string
}

export interface MediaUploadResponse {
  url: string
  id?: string
  filename?: string
  originalName?: string
  size?: number
  mimeType?: string
  thumbnailUrl?: string
}
