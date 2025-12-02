import type { GetUserByIdResponse, UsersAPI } from '../interfaces/users'
import type { ApiError } from '../interfaces/commons'
import { mockOrganizations } from './data/organizations'
import type { UserID } from '../types/users'

export const mockUsersApi: UsersAPI = {
  async getUserById(id: UserID): Promise<GetUserByIdResponse> {
    const user = mockOrganizations.find((u) => u.id === id)
    if (!user) {
      throw {
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        status: 404,
      } as ApiError
    }
    return { user }
  },
}
