import type { User, UserID } from '../types/users'
import type { PaginatedRequest } from './commons'

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

export interface SearchUsersResponse {
  users: User[]
}

export interface UsersAPI {
  getUserById(id: UserID): Promise<GetUserByIdResponse>
  register(data: RegisterRequest): Promise<RegisterResponse>
  login(credentials: LoginRequest): Promise<LoginResponse>
  logout(): Promise<LogoutResponse>
  refreshToken(): Promise<RefreshTokenResponse>
  searchByName(query: string): Promise<SearchUsersResponse>
  getOrganizations(query: string, pagination?: PaginatedRequest): Promise<SearchUsersResponse>
}
