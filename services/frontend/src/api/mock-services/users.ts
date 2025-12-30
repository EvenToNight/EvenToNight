import type {
  GetUserByIdResponse,
  UsersAPI,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  RegisterResponse,
  RegisterRequest,
} from '../interfaces/users'
import type { ApiError, PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import { mockOrganizations } from './data/organizations'
import { mockUsers } from './data/members'
import type { UserID, User, UserRole } from '../types/users'
import { getPaginatedItems } from '../utils/requestUtils'

let currentLoggedInEmail: string | null = null

const getMockUser = (email: string): User => {
  const user = [...mockOrganizations, ...mockUsers].find((u) => u.email === email)
  if (!user) {
    throw {
      message: 'User not found',
      status: 404,
    } as ApiError
  }
  return user
}

export const mockUsersApi: UsersAPI = {
  async getUserById(id: UserID): Promise<GetUserByIdResponse> {
    const user = [...mockOrganizations, ...mockUsers].find((u) => u.id === id)
    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      } as ApiError
    }
    return { user }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    let user: User | undefined
    if (data.isOrganization) {
      user = mockOrganizations[0]
    } else {
      user = mockUsers[0]
    }
    if (user) {
      return {
        accessToken: 'mock_access_token_' + Date.now(),
        expiresIn: 900,
        user,
      }
    } else {
      throw {
        message: 'Registration failed',
        status: 400,
      } as ApiError
    }
  },
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const user = getMockUser(credentials.email)
    currentLoggedInEmail = credentials.email
    return {
      accessToken: 'mock_access_token_' + Date.now(),
      expiresIn: 900,
      user,
    }
  },

  async logout(): Promise<LogoutResponse> {
    currentLoggedInEmail = null
    return {
      success: true,
    }
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    if (!currentLoggedInEmail) {
      throw {
        message: 'No refresh token found',
        status: 401,
      } as ApiError
    }

    return {
      accessToken: 'mock_access_token_refreshed_' + Date.now(),
      expiresIn: 900,
      user: getMockUser(currentLoggedInEmail),
    }
  },

  async searchUsers(params: {
    name?: string
    pagination?: PaginatedRequest
    role?: UserRole
  }): Promise<PaginatedResponse<User>> {
    const lowerName = (params.name ?? '').toLowerCase().trim()
    const allUsers = [...mockOrganizations, ...mockUsers]
      .filter((user) => (params.role ? user.role === params.role : true))
      .filter((user) => user.name.toLowerCase().includes(lowerName))
    return getPaginatedItems(allUsers, params.pagination)
  },
}
