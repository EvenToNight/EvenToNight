import type {
  GetUserByIdResponse,
  UsersAPI,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  SearchUsersResponse,
  RegisterResponse,
  RegisterRequest,
} from '../interfaces/users'
import type { User, UserID } from '../types/users'
import type { ApiClient } from '../client'
import { buildQueryParams } from '../utils'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'

export const createUsersApi = (usersClient: ApiClient): UsersAPI => ({
  async getUserById(id: UserID): Promise<GetUserByIdResponse> {
    return usersClient.get<GetUserByIdResponse>(`/users/${id}`)
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return usersClient.post<RegisterResponse>('/auth/register', data, { credentials: true })
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return usersClient.post<LoginResponse>('/auth/login', credentials, { credentials: true })
  },

  async logout(): Promise<LogoutResponse> {
    return usersClient.post<LogoutResponse>('/auth/logout', undefined, { credentials: true })
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    return usersClient.post<RefreshTokenResponse>('/auth/refresh', undefined, { credentials: true })
  },

  async searchByName(query: string): Promise<SearchUsersResponse> {
    return usersClient.get<SearchUsersResponse>(
      `/users${buildQueryParams({ query: encodeURIComponent(query) })}`
    )
  },

  async getOrganizations(
    query: string,
    pagination?: PaginatedRequest
  ): Promise<SearchUsersResponse> {
    const queryParams = buildQueryParams({ query, ...pagination })
    return {
      users: (await usersClient.get<PaginatedResponse<User>>(`/users/organizations${queryParams}`))
        .items,
    }
  },
})
