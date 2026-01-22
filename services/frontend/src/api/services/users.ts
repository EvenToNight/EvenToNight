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
    console.log('Login response data:', data)
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
    const res = await usersClient.get<UserAPIResponse>(`/${id}`)
    console.log('Fetched user by ID:', { id, res })
    return UserAdapter.fromApi(res)
  },

  async deleteUserById(id: UserID): Promise<void> {
    return usersClient.delete<void>(`/${id}`)
  },

  //TODO: check update and removal of all optional fields
  async updateUserById(id: UserID, data: Partial<User>): Promise<void> {
    return usersClient.put<void>(`/${id}`, UserAdapter.toApi(data))
  },

  async updateUserAvatarById(id: UserID, avatarFile: File | null): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }
    //TODO: handle deletion of avatar when no file is provided
    return usersClient.post<{ avatarUrl: string }>(`/${id}`, formData)
  },

  async changePassword(userId: UserID, data: ChangePasswordRequest): Promise<void> {
    return usersClient.put<void>(`/${userId}/password`, data)
  },

  async searchUsers(params: {
    prefix?: string
    pagination?: PaginatedRequest
    role?: string
  }): Promise<PaginatedResponse<User>> {
    //TODO uniform API?
    const { pagination = { ...evaluatePagination(params.pagination) }, ...rest } = params
    const response = await usersClient.get<PaginatedResponse<User> & { data: User[] }>(
      `/search${buildQueryParams({ ...pagination, ...rest })}`
    )
    return {
      ...response,
      items: response.data,
    }
  },
})
