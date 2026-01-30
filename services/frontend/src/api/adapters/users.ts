import type {
  LoginAPIResponse,
  LoginResponse,
  ProfileAPI,
  UpdateUserAPIRequest,
  UserAPIResponse,
} from '../interfaces/users'
import type { Profile, User } from '../types/users'

function adaptProfile(dto: ProfileAPI): Profile {
  return {
    name: dto.name,
    avatar: dto.avatar,
    bio: dto.bio,
    website: Array.isArray(dto.contacts) && dto.contacts.length > 0 ? dto.contacts[0] : undefined,
  }
}

export const LoginAdapter = {
  fromApi(dto: LoginAPIResponse): LoginResponse {
    const user: User = {
      ...dto.account,
      ...adaptProfile(dto.profile),
      id: dto.id,
      role: dto.role,
    }
    return {
      accessToken: dto.accessToken,
      expiresIn: dto.expiresIn,
      refreshToken: dto.refreshToken,
      refreshExpiresIn: dto.refreshExpiresIn,
      user,
    }
  },
}

export const UserAdapter = {
  fromApi(dto: UserAPIResponse): User {
    console.log('Adapting user from API:', dto)
    return {
      id: dto.id,
      role: dto.role,
      ...dto.account,
      ...adaptProfile(dto.profile),
    }
  },

  toApi(
    user: Partial<User> & { username: string; name: string; avatar: string }
  ): Partial<UpdateUserAPIRequest> {
    return {
      accountDTO: {
        username: user.username,
        darkMode: user.darkMode,
        language: user.language,
        gender: user.gender,
        birthDate: user.birthDate,
        interests: user.interests,
      },
      profileDTO: {
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        contacts: user.website ? [user.website] : [],
      },
    }
  },
}
