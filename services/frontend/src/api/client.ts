import type { ApiError } from './interfaces/commons'

const getServiceUrl = (service: string): string => {
  const host = import.meta.env.VITE_HOST
  if (!host) {
    throw new Error('Environment variable VITE_HOST is not defined')
  }
  return `http://${service}.${host}`
}

export class ApiClient {
  private baseUrl: string

  constructor(service: string) {
    this.baseUrl = getServiceUrl(service)
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only add Content-Type for requests with a body
    if (options.method !== 'GET' && options.method !== 'DELETE') {
      headers['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        }
        throw error
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        const apiError: ApiError = {
          message: error.message,
        }
        throw apiError
      }
      throw error
    }
  }
}

// Factory functions to create service-specific clients on demand
export const createEventsClient = () => new ApiClient('events')
export const createUsersClient = () => new ApiClient('users')
export const createMediaClient = () => new ApiClient('media')
export const createFeedClient = () => new ApiClient('feed')
export const createInteractionsClient = () => new ApiClient('interactions')
