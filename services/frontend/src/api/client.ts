import type { ApiError } from './interfaces/commons'

const getServiceUrl = (service: string): string => {
  const host = import.meta.env.VITE_HOST
  if (!host) {
    throw new Error('Environment variable VITE_HOST is not defined')
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
  private baseUrl: string

  constructor(service: string) {
    this.baseUrl = getServiceUrl(service)
  }

  async get<T>(endpoint: string, options?: { credentials?: boolean }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  async post<T>(endpoint: string, data?: unknown, options?: { credentials?: boolean }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: { credentials?: boolean }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  async delete<T>(endpoint: string, options?: { credentials?: boolean }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...(options?.credentials && { credentials: 'include' }),
    })
  }

  private async request<T>(endpoint: string, options: RequestInit, isRetry = false): Promise<T> {
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
    if (options.method !== 'GET' && options.method !== 'DELETE') {
      headers['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    const response = await fetch(url, config)

    // Handle token expiration (401 Unauthorized)
    if (response.status === 401 && !isRetry && onTokenExpired) {
      const refreshed = await onTokenExpired()
      if (refreshed) {
        // Retry the request with new token
        return this.request<T>(endpoint, options, true)
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP error! status: ${response.status}, message: ${response.body}`,
        status: response.status,
      }
      throw error
    }

    return (await response.json()) as T
  }
}

export const createEventsClient = () => new ApiClient('events')
export const createUsersClient = () => new ApiClient('users')
export const createMediaClient = () => new ApiClient('media')
export const createFeedClient = () => new ApiClient('feed')
export const createInteractionsClient = () => new ApiClient('interactions')
