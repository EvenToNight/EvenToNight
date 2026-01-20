import type {
  UsersAPI,
  LoginRequest,
  LoginResponse,
  TokenResponse,
  RegistrationRequest,
  ChangePasswordRequest,
} from '../interfaces/users'
import type { ApiError, PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { UserID, User, UserRole } from '../types/users'
import { getPaginatedItems } from '@/api/utils/requestUtils'
import { generateFakeToken, ONE_YEAR } from '@/api/utils/authUtils'
import { mockUsers } from './data/users'
import type { RefreshToken } from '../interfaces/users'

let currentLoggedInUsername: string | null = null

const getMockUser = (username: string): User => {
  const user = mockUsers.data.find((u) => u.email === username || u.name === username)
  if (!user) {
    throw {
      message: 'User not found',
      status: 404,
    } as ApiError
  }
  return user
}

export const searchMockUsersByName = (name: string): User[] => {
  const lowerName = name.toLowerCase().trim()
  return mockUsers.data.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerName) || user.username.toLowerCase().includes(lowerName)
  )
}

export const mockUsersApi: UsersAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    currentLoggedInUsername = credentials.username
    const user = getMockUser(credentials.username)
    return {
      accessToken: generateFakeToken(user.id, ONE_YEAR),
      expiresIn: ONE_YEAR,
      refreshToken: generateFakeToken(user.id, ONE_YEAR),
      refreshExpiresIn: ONE_YEAR,
      user,
    }
  },

  async register(data: RegistrationRequest): Promise<LoginResponse> {
    let user: User | undefined
    if (data.role === 'organization') {
      user = mockUsers.organizations()[0]
    } else {
      user = mockUsers.members()[0]
    }
    if (user) {
      return {
        accessToken: generateFakeToken(user.id, ONE_YEAR),
        expiresIn: ONE_YEAR,
        refreshToken: generateFakeToken(user.id, ONE_YEAR),
        refreshExpiresIn: ONE_YEAR,
        user,
      }
    } else {
      throw {
        message: 'Registration failed',
        status: 400,
      } as ApiError
    }
  },

  async refreshToken(): Promise<TokenResponse> {
    const user = getMockUser(currentLoggedInUsername!)
    return {
      accessToken: generateFakeToken(user.id, ONE_YEAR),
      expiresIn: ONE_YEAR,
      refreshToken: generateFakeToken(user.id, ONE_YEAR),
      refreshExpiresIn: ONE_YEAR,
    }
  },

  async logout(_refreshToken: RefreshToken): Promise<void> {
    currentLoggedInUsername = null
    return
  },

  async getUsers(pagination?: PaginatedRequest): Promise<PaginatedResponse<User>> {
    return getPaginatedItems(mockUsers.data, pagination)
  },

  async getUserById(id: UserID): Promise<User> {
    const user = mockUsers.data.find((u) => u.id === id)
    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      } as ApiError
    }
    return user
  },

  async deleteUserById(_id: UserID): Promise<void> {
    return
  },

  async updateUserById(_id: UserID, _data: Partial<User>): Promise<void> {
    return
  },

  async updateUserAvatarById(id: UserID, _avatarFile: File): Promise<{ avatarUrl: string }> {
    return this.getUserById(id).then((user) => ({ avatarUrl: user.avatar }))
  },

  async changePassword(_userId: UserID, _data: ChangePasswordRequest): Promise<void> {
    return
  },

  async searchUsers(params: {
    prefix?: string
    pagination?: PaginatedRequest
    role?: UserRole
  }): Promise<PaginatedResponse<User>> {
    const lowerName = (params.prefix ?? '').toLowerCase().trim()
    const allUsers = mockUsers.data
      .filter((user) => (params.role ? user.role === params.role : true))
      .filter((user) => user.name.toLowerCase().includes(lowerName))
    return getPaginatedItems(allUsers, params.pagination)
  },
}
