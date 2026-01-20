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

//TODO: confirm password is needed?
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type AccessToken = string
export type RefreshToken = string

export type ProfileAPI = Omit<Profile, 'website'> & {
  constacts: string[]
}
export interface TokenResponse {
  accessToken: AccessToken
  expiresIn: number
  refreshToken: RefreshToken
  refreshExpiresIn: number
}

export interface UserAPIResponse {
  id: UserID
  username: string
  profile: ProfileAPI
  role: UserRole
}

export interface LoginAPIResponse extends TokenResponse {
  role: UserRole
  account: Account
  profile: ProfileAPI
}

export interface UpdateUserAPIRequest {
  accountDTO: Account
  profileDTO: ProfileAPI
}

export interface LoginResponse extends TokenResponse {
  user: User
}

export interface UsersAPI {
  login(credentials: LoginRequest): Promise<LoginResponse>
  register(data: RegistrationRequest): Promise<LoginResponse>
  refreshToken(refreshToken: RefreshToken): Promise<TokenResponse>
  logout(refreshToken: RefreshToken): Promise<void>

  //TODO: add pagination to backend
  getUsers(pagination?: PaginatedRequest): Promise<PaginatedResponse<User>>
  getUserById(id: UserID): Promise<User>
  deleteUserById(id: UserID): Promise<void>
  updateUserById(id: UserID, data: Partial<User>): Promise<void>
  updateUserAvatarById(id: UserID, avatarFile: File): Promise<void>

  changePassword(userId: UserID, data: ChangePasswordRequest): Promise<void>
  searchUsers(params: {
    prefix?: string
    pagination?: PaginatedRequest
    role?: UserRole
  }): Promise<PaginatedResponse<User>>
}
