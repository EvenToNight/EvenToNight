import type {
  UsersAPI,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  RegistrationRequest,
  ChangePasswordRequest,
} from '../interfaces/users'
import type { User, UserID } from '../types/users'
import type { ApiClient } from '../client'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'

export const createUsersApi = (usersClient: ApiClient): UsersAPI => ({
  async getUserById(id: UserID): Promise<User> {
    return usersClient.get<User>(`/${id}`)
  },

  async register(data: RegistrationRequest): Promise<LoginResponse> {
    const body = { userType: data.role, ...data }
    return usersClient.post<LoginResponse>('/register', body)
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return usersClient.post<LoginResponse>('/login', credentials)
  },

  async logout(): Promise<LogoutResponse> {
    return usersClient.post<LogoutResponse>('/logout', undefined, { credentials: true })
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    return usersClient.post<RefreshTokenResponse>('/refresh', undefined, { credentials: true })
  },

  async changePassword(userId: UserID, data: ChangePasswordRequest): Promise<void> {
    return usersClient.post<void>(`/${userId}/change-password`, data)
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
