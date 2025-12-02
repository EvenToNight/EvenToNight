import type { GetUserByIdRequest, GetUserByIdResponse, UsersAPI } from '../interfaces/users'
import type { ApiError } from '../interfaces/commons'
import { mockOrganizations } from './data/organizations'
export const mockUserApi: UsersAPI = {
  async getUserById(request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    const user = mockOrganizations.find((u) => u.id === request.userId)
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
