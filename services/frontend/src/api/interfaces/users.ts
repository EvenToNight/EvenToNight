import type { User, UserID, UserRole } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'

export interface GetUserByIdResponse {
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  isOrganization: boolean
}

export interface RegisterResponse {
  accessToken: string
  expiresIn: number
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  user: User
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
  getUserById(id: UserID): Promise<GetUserByIdResponse>
  register(data: RegisterRequest): Promise<RegisterResponse>
  login(credentials: LoginRequest): Promise<LoginResponse>
  logout(): Promise<LogoutResponse>
  refreshToken(): Promise<RefreshTokenResponse>
  searchUsers(params: {
    name?: string
    pagination?: PaginatedRequest
    role?: UserRole
  }): Promise<PaginatedResponse<User>>
}
