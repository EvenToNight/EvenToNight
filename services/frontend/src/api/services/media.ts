// Real Images API Implementation
// Mimics media service API structure
import type { MediaUploadResponse } from '../types/media'

class ImagesClient {
  private baseUrl: string

  constructor() {
    // Points to media service
    this.baseUrl = import.meta.env.VITE_IMAGES_API_URL || 'http://localhost:9020'
  }

  /**
   * POST /:type/:entityId
   * Upload a new image
   */
  async upload(file: File, type: string, entityId: string | number): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/${type}/${entityId}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    const data = await response.json()
    // Response: { url: "type/entityId/filename" }
    return {
      id: data.url,
      url: `${this.baseUrl}/${data.url}`,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    }
  }

  /**
   * PUT /:type/:entityId
   * Update existing image
   */
  async update(file: File, type: string, entityId: string | number): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/${type}/${entityId}`, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Update failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      id: data.url,
      url: `${this.baseUrl}/${data.url}`,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    }
  }

  /**
   * GET /*
   * Get image by path with fallback to defaults
   */
  async getByPath(path: string): Promise<MediaUploadResponse> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    const response = await fetch(`${this.baseUrl}${normalizedPath}`)

    if (!response.ok) {
      throw new Error(`Get failed: ${response.status}`)
    }

    // Media service returns the image file directly
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    return {
      id: path,
      url,
      filename: path.split('/').pop() || path,
    }
  }

  /**
   * DELETE /:type/:entityId/:filename
   * Delete image
   */
  async delete(type: string, entityId: string | number, filename: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${type}/${entityId}/${filename}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Delete failed: ${response.status}`)
    }
  }
}

const imagesClient = new ImagesClient()

export const imagesApi = {
  /**
   * Upload image - POST /:type/:entityId
   */
  async upload(file: File, type: string, entityId: string | number): Promise<MediaUploadResponse> {
    return imagesClient.upload(file, type, entityId)
  },

  /**
   * Update image - PUT /:type/:entityId
   */
  async update(file: File, type: string, entityId: string | number): Promise<MediaUploadResponse> {
    return imagesClient.update(file, type, entityId)
  },

  /**
   * Get image by path - GET /*
   */
  async getByPath(path: string): Promise<MediaUploadResponse> {
    return imagesClient.getByPath(path)
  },

  /**
   * Alias for compatibility
   */
  async getById(id: string): Promise<MediaUploadResponse> {
    return this.getByPath(id)
  },

  /**
   * Delete image - DELETE /:type/:entityId/:filename
   */
  async delete(type: string, entityId: string | number, filename: string): Promise<void> {
    return imagesClient.delete(type, entityId, filename)
  },

  /**
   * Delete by full path (convenience)
   */
  async deleteByPath(path: string): Promise<void> {
    // Parse path: "type/entityId/filename"
    const parts = path.split('/')
    if (parts.length < 3) {
      throw new Error('Invalid path format. Expected: type/entityId/filename')
    }
    const type = parts[0]
    const entityId = parts[1]
    const filename = parts.slice(2).join('/')

    if (!type || !entityId || !filename) {
      throw new Error('Invalid path format. Expected: type/entityId/filename')
    }

    return this.delete(type, entityId, filename)
  },
}
