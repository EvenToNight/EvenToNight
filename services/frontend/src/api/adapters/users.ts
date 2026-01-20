import type {
  LoginAPIResponse,
  LoginResponse,
  ProfileAPI,
  UpdateUserAPIRequest,
  UserAPIResponse,
} from '../interfaces/users'
import type { Profile, User } from '../types/users'
import { jwtDecode } from 'jwt-decode'

function adaptProfile(dto: ProfileAPI): Profile {
  return {
    name: dto.name,
    avatar: dto.avatar,
    bio: dto.bio,
    website:
      Array.isArray(dto.constacts) && dto.constacts.length > 0 ? dto.constacts[0] : undefined,
  }
}

export const LoginAdapter = {
  fromApi(dto: LoginAPIResponse): LoginResponse {
    const decoded: { user_id: string } = jwtDecode(dto.accessToken)
    const user: User = {
      ...dto.account,
      ...adaptProfile(dto.profile),
      id: decoded.user_id,
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
    return {
      id: dto.id,
      role: dto.role,
      username: dto.username,
      ...adaptProfile(dto.profile),
    }
  },

  toApi(user: Partial<User>): Partial<UpdateUserAPIRequest> {
    return {
      accountDTO: {
        username: user.username!,
        darkMode: user.darkMode,
        language: user.language,
        gender: user.gender,
        birthDate: user.birthDate,
        interests: user.interests,
      },
      profileDTO: {
        name: user.name!,
        avatar: user.avatar!,
        bio: user.bio,
        constacts: user.website ? [user.website] : [],
      },
    }
  },
}
