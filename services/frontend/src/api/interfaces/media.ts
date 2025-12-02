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

export interface MediaAPI {
  get(url: string): Promise<MediaGetResponse>
  upload(request: MediaUploadRequest): Promise<MediaUploadResponse>
}
