import type {
  GetUserByIdResponse,
  UsersAPI,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  SearchUsersByNameResponse,
} from '../interfaces/users'
import type { ApiError } from '../interfaces/commons'
import { mockOrganizations } from './data/organizations'
import { mockUsers } from './data/members'
import type { UserID, User } from '../types/users'

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

  async searchByName(query: string): Promise<SearchUsersByNameResponse> {
    if (!query || query.trim().length === 0) {
      return { users: [] }
    }

    const lowerQuery = query.toLowerCase().trim()
    const allUsers = [...mockOrganizations, ...mockUsers]

    const matchedUsers = allUsers.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(lowerQuery)
      const bioMatch = user.bio?.toLowerCase().includes(lowerQuery)
      return nameMatch || bioMatch
    })

    return { users: matchedUsers }
  },
}
