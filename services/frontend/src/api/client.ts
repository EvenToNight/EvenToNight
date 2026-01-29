import type { ApiError } from './interfaces/commons'
import { dateReviver } from '@/api/utils/parsingUtils'

const getServiceUrl = (service: string): string => {
  const host = import.meta.env.VITE_HOST || 'localhost'
  if (!host) {
    throw new Error('Environment variable VITE_HOST is not defined')
  }
  if (import.meta.env.VITE_USE_HTTPS === 'true') {
    return `https://${service}.${host}`
  }
  return `http://${service}.${host}`
}

// JWT Token provider function will be set by the app
let tokenProvider: (() => string | null) | null = null
export const setTokenProvider = (provider: () => string | null) => {
  tokenProvider = provider
}

// Callback when token needs refresh (401/403 response)
let onTokenExpired: (() => Promise<boolean>) | null = null
export const setTokenExpiredCallback = (callback: () => Promise<boolean>) => {
  onTokenExpired = callback
}

export class ApiClient {
  baseUrl: string
  private service: string

  constructor(service: string) {
    this.baseUrl = getServiceUrl(service)
    this.service = service
  }

  async get<T>(endpoint: string, options?: { credentials?: boolean }): Promise<T> {
    return this.requestJson<T>(endpoint, {
      method: 'GET',
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  async post<T>(endpoint: string, data?: unknown, options?: { credentials?: boolean }): Promise<T> {
    const isFormData = data instanceof FormData
    return this.requestJson<T>(endpoint, {
      method: 'POST',
      body: isFormData ? (data as BodyInit) : JSON.stringify(data),
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: { credentials?: boolean }): Promise<T> {
    return this.requestJson<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  async delete<T>(endpoint: string, options?: { credentials?: boolean }): Promise<T> {
    return this.requestJson<T>(endpoint, {
      method: 'DELETE',
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  async getFile(endpoint: string, options?: { credentials?: boolean }): Promise<File> {
    const blob = await this.requestBlob(endpoint, {
      method: 'GET',
      ...(options?.credentials && { credentials: 'include' }),
    })
    const filename = endpoint.split('/').pop() || `${this.service}-file`
    return new File([blob], filename, { type: blob.type })
  }

  async getBlob(endpoint: string, options?: { credentials?: boolean }): Promise<Blob> {
    return this.requestBlob(endpoint, {
      method: 'GET',
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  private async requestBlob(endpoint: string, options: RequestInit): Promise<Blob> {
    return (await this.request(endpoint, options)).blob()
  }
  private async requestJson<T>(endpoint: string, options: RequestInit): Promise<T> {
    const response = await this.request(endpoint, options)
    const text = await response.text()
    return text ? (JSON.parse(text, dateReviver) as T) : ({} as T)
  }
  private async request(
    endpoint: string,
    options: RequestInit,
    isRetry = false
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Add JWT token if available
    const token = tokenProvider?.()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Only add Content-Type for requests with a body
    if (
      options.method !== 'GET' &&
      options.method !== 'DELETE' &&
      !(options.body instanceof FormData)
    ) {
      headers['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    console.log(`API Request: ${options.method} ${url}`)
    const response = await fetch(url, config)
    console.log(`API Response: ${options.method} ${url} - Status: ${response.status}`)

    // Handle token expiration (401 Unauthorized)
    if (response.status === 401 && !isRetry && onTokenExpired) {
      const refreshed = await onTokenExpired()
      if (refreshed) {
        // Retry the request with new token
        return this.request(endpoint, options, true)
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      const errorBody = await response.text()
      if (errorBody) {
        errorMessage = errorBody
      }
      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      }
      throw error
    }
    return response
  }
}

export const createEventsClient = () => new ApiClient('events')
export const createUsersClient = () => new ApiClient('users')
export const createMediaClient = () => new ApiClient('media')
export const createFeedClient = () => new ApiClient('feed')
export const createInteractionsClient = () => new ApiClient('interactions')
export const createChatClient = () => new ApiClient('chat')
export const createPaymentsClient = () => new ApiClient('payments')
export const createNotificationsClient = () => new ApiClient('notifications')
