import type { Account, Profile, User, UserID, UserRole } from '../types/users'
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

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export type AccessToken = string
export type RefreshToken = string

export type ProfileAPIResponse = Omit<Profile, 'website'> & {
  constacts: string[]
}

export interface UserAPIResponse {
  username: string
  profile: ProfileAPIResponse
  role: UserRole
}

export interface LoginAPIResponse {
  accessToken: AccessToken
  expiresIn: number
  refreshToken: RefreshToken
  refreshExpiresIn: number
  role: UserRole
  account: Account
  profile: ProfileAPIResponse
}

export interface LoginResponse {
  accessToken: AccessToken
  expiresIn: number
  refreshToken: RefreshToken
  refreshExpiresIn: number
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
  getUserById(id: UserID): Promise<User>
  register(data: RegistrationRequest): Promise<LoginResponse>
  login(credentials: LoginRequest): Promise<LoginResponse>
  logout(): Promise<LogoutResponse>
  refreshToken(): Promise<RefreshTokenResponse>
  changePassword(userId: UserID, data: ChangePasswordRequest): Promise<void>
  searchUsers(params: {
    name?: string
    pagination?: PaginatedRequest
    role?: UserRole
  }): Promise<PaginatedResponse<User>>
}
