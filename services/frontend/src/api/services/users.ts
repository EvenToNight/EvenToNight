import type {
  UsersAPI,
  LoginRequest,
  LoginResponse,
  TokenResponse,
  RefreshToken,
  RegistrationRequest,
  ChangePasswordRequest,
  LoginAPIResponse,
  UserAPIResponse,
} from '../interfaces/users'
import type { User, UserID } from '../types/users'
import type { ApiClient } from '../client'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import { LoginAdapter, UserAdapter } from '../adapters/users'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
export const createUsersApi = (usersClient: ApiClient): UsersAPI => ({
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const data = LoginAdapter.fromApi(
      await usersClient.post<LoginAPIResponse>('/login', credentials)
    )
    logger.log('Login response data:', data)
    return data
  },

  async register(data: RegistrationRequest): Promise<LoginResponse> {
    return LoginAdapter.fromApi(await usersClient.post<LoginAPIResponse>('/register', data))
  },

  async refreshToken(refreshToken: RefreshToken): Promise<TokenResponse> {
    return usersClient.post<TokenResponse>('/refresh', { refreshToken })
  },

  async logout(refreshToken: RefreshToken): Promise<void> {
    return usersClient.post<void>('/logout', { refreshToken })
  },

  async getUserById(id: UserID): Promise<User> {
    const res = await usersClient.get<UserAPIResponse>(`/${id}`)
    logger.log('Fetched user by ID:', { id, res })
    return UserAdapter.fromApi(res)
  },

  async deleteUserById(id: UserID): Promise<void> {
    return usersClient.delete<void>(`/${id}`)
  },

  //TODO: check update and removal of all optional fields
  async updateUserById(
    id: UserID,
    data: Partial<User> & { username: string; name: string; avatar: string }
  ): Promise<void> {
    return usersClient.put<void>(`/${id}`, UserAdapter.toApi(data))
  },

  async updateUserAvatarById(id: UserID, avatarFile: File | null): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }
    return usersClient.post<{ avatarUrl: string }>(`/${id}/avatar`, formData)
  },

  async deleteUserAvatarById(id: UserID): Promise<void> {
    return usersClient.delete<void>(`/${id}/avatar`)
  },

  async changePassword(userId: UserID, data: ChangePasswordRequest): Promise<void> {
    return usersClient.put<void>(`/${userId}/password`, data)
  },

  async searchUsers(params: {
    prefix?: string
    pagination?: PaginatedRequest
    role?: string
  }): Promise<PaginatedResponse<User>> {
    const { pagination = { ...evaluatePagination(params.pagination) }, ...rest } = params
    const response = await usersClient.get<
      PaginatedResponse<UserAPIResponse> & { data: UserAPIResponse[] }
    >(`/search${buildQueryParams({ ...pagination, ...rest })}`)
    return {
      ...response,
      items: response.data.map((user) => UserAdapter.fromApi(user)),
    }
  },
})
