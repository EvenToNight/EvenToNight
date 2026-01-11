import type {
  UsersAPI,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  RegistrationRequest,
  ChangePasswordRequest,
} from '../interfaces/users'
import type { ApiError, PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { UserID, User, UserRole } from '../types/users'
import { getPaginatedItems } from '@/api/utils/requestUtils'
import { generateFakeToken, ONE_YEAR } from '@/api/utils/authUtils'
import { mockUsers } from './data/users'

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

  async register(data: RegistrationRequest): Promise<LoginResponse> {
    let user: User | undefined
    if (data.role === 'organization') {
      user = mockUsers.organizations()[0]
    } else {
      user = mockUsers.members()[0]
    }
    if (user) {
      return {
        token: generateFakeToken(user.id, ONE_YEAR),
      }
    } else {
      throw {
        message: 'Registration failed',
        status: 400,
      } as ApiError
    }
  },
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    currentLoggedInUsername = credentials.username
    const user = getMockUser(credentials.username)
    return {
      token: generateFakeToken(user.id, ONE_YEAR),
    }
  },

  async logout(): Promise<LogoutResponse> {
    currentLoggedInUsername = null
    return {
      success: true,
    }
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    if (!currentLoggedInUsername) {
      throw {
        message: 'No refresh token found',
        status: 401,
      } as ApiError
    }

    return {
      accessToken: 'mock_access_token_refreshed_' + Date.now(),
      expiresIn: 900,
      user: getMockUser(currentLoggedInUsername),
    }
  },

  async changePassword(userId: UserID, _data: ChangePasswordRequest): Promise<void> {
    const user = mockUsers.data.find((u) => u.id === userId)
    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      } as ApiError
    }

    //TODO: evaluate save and validate current password
    return
  },

  async searchUsers(params: {
    name?: string
    pagination?: PaginatedRequest
    role?: UserRole
  }): Promise<PaginatedResponse<User>> {
    const lowerName = (params.name ?? '').toLowerCase().trim()
    const allUsers = mockUsers.data
      .filter((user) => (params.role ? user.role === params.role : true))
      .filter((user) => user.name.toLowerCase().includes(lowerName))
    return getPaginatedItems(allUsers, params.pagination)
  },
}
