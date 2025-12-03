import type {
  GetUserByIdResponse,
  UsersAPI,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '../interfaces/users'
import type { UserID } from '../types/users'
import type { ApiClient } from '../client'

export const createUsersApi = (usersClient: ApiClient): UsersAPI => ({
  async getUserById(id: UserID): Promise<GetUserByIdResponse> {
    return usersClient.get<GetUserByIdResponse>(`/users/${id}`)
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
})
