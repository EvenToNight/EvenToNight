import type {
  GetUserByIdResponse,
  UsersAPI,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  RegisterResponse,
  RegisterRequest,
} from '../interfaces/users'
import type { User, UserID } from '../types/users'
import type { ApiClient } from '../client'
import { buildQueryParams, evaluatePagination } from '../utils'
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

  async searchUsers(params: {
    name?: string
    pagination?: PaginatedRequest
    role?: string
  }): Promise<PaginatedResponse<User>> {
    const { pagination = { ...evaluatePagination(params.pagination) }, ...rest } = params
    return usersClient.get<PaginatedResponse<User>>(
      `/search${buildQueryParams({ ...pagination, ...rest })}`
    )
  },
})
