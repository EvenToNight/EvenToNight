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
import { buildQueryParams, evaluatePagination, getPaginatedItems } from '../utils/requestUtils'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import { LoginAdapter, UserAdapter } from '../adapters/users'

export const createUsersApi = (usersClient: ApiClient): UsersAPI => ({
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const data = LoginAdapter.fromApi(
      await usersClient.post<LoginAPIResponse>('/login', credentials)
    )
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

  async getUsers(pagination?: PaginatedRequest): Promise<PaginatedResponse<User>> {
    const response = (await usersClient.get<UserAPIResponse[]>('/')).map(UserAdapter.fromApi)
    return getPaginatedItems(response, pagination)
  },

  async getUserById(id: UserID): Promise<User> {
    return UserAdapter.fromApi(await usersClient.get<UserAPIResponse>(`/${id}`))
  },

  async deleteUserById(id: UserID): Promise<void> {
    return usersClient.delete<void>(`/${id}`)
  },

  //TODO: check update and removal of all optional fields
  async updateUserById(id: UserID, data: Partial<User>): Promise<void> {
    return usersClient.put<void>(`/${id}`, UserAdapter.toApi(data))
  },

  async updateUserAvatarById(id: UserID, avatarFile: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    return usersClient.post<{ avatarUrl: string }>(`/${id}`, formData)
  },

  async changePassword(userId: UserID, data: ChangePasswordRequest): Promise<void> {
    return usersClient.post<void>(`/${userId}/password`, data)
  },

  async searchUsers(params: {
    prefix?: string
    pagination?: PaginatedRequest
    role?: string
  }): Promise<PaginatedResponse<User>> {
    const { pagination = { ...evaluatePagination(params.pagination) }, ...rest } = params
    return usersClient.get<PaginatedResponse<User>>(
      `/search${buildQueryParams({ ...pagination, ...rest })}`
    )
  },
})
