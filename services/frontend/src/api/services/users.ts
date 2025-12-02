import type { GetUserByIdResponse, UsersAPI } from '../interfaces/users'
import type { UserID } from '../types/users'
import type { ApiClient } from '../client'

export const createUsersApi = (_usersClient: ApiClient): UsersAPI => ({
  async getUserById(_id: UserID): Promise<GetUserByIdResponse> {
    throw new Error('Not implemented')
  },
})
