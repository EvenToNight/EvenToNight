import type { User, UserID, UserRole } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'

export interface RegistrationRequest {
  username: string
  email: string
  password: string
  role: UserRole
}
export interface LoginRequest {
  username: string
  password: string
}

export type AccessToken = string

export interface LoginResponse {
  token: AccessToken
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
  user: User
}

export interface LogoutResponse {
  success: boolean
}

export interface UsersAPI {
  getUserById(id: UserID): Promise<User>
  register(data: RegistrationRequest): Promise<LoginResponse>
  login(credentials: LoginRequest): Promise<LoginResponse>
  logout(): Promise<LogoutResponse>
  refreshToken(): Promise<RefreshTokenResponse>
  searchUsers(params: {
    name?: string
    pagination?: PaginatedRequest
    role?: UserRole
  }): Promise<PaginatedResponse<User>>
}
