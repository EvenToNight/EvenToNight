import type { GetUserByIdResponse, UsersAPI } from '../interfaces/users'
import type { UserID } from '../types/users'
import type { ApiClient } from '../client'

export const createUsersApi = (usersClient: ApiClient): UsersAPI => ({
  async getUserById(id: UserID): Promise<GetUserByIdResponse> {
    return usersClient.get<GetUserByIdResponse>(`/users/${id}`)
  },
})
