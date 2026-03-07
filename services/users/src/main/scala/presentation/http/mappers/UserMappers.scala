package presentation.http.mappers

import application.dto.UserTokens
import domain.aggregates.Member
import domain.aggregates.Organization
import domain.aggregates.RegisteredUser
import presentation.http.dto.response.auth.LoginResponseDTO
import presentation.http.dto.response.user.UserDTO
import presentation.http.dto.response.user.UsernameDTO

import AccountMappers.toAccountDTO
import ProfileMappers.toProfileDTO

object UserMappers:
  extension (user: RegisteredUser)
    def toLoginDTO(userId: String, tokens: UserTokens, role: String): LoginResponseDTO =
      user match
        case member: Member =>
          LoginResponseDTO(
            id = userId,
            role = role,
            account = member.account.toAccountDTO,
            profile = member.profile.toProfileDTO,
            accessToken = tokens.accessToken,
            expiresIn = tokens.expiresIn,
            refreshToken = tokens.refreshToken,
            refreshExpiresIn = tokens.refreshExpiresIn
          )
        case org: Organization =>
          LoginResponseDTO(
            id = userId,
            role = role,
            account = org.account.toAccountDTO,
            profile = org.profile.toProfileDTO,
            accessToken = tokens.accessToken,
            expiresIn = tokens.expiresIn,
            refreshToken = tokens.refreshToken,
            refreshExpiresIn = tokens.refreshExpiresIn
          )

    def toUserDTO(userId: String, role: String): UserDTO =
      user match
        case member: Member =>
          UserDTO(
            id = userId,
            role = role,
            account = UsernameDTO(member.account.username),
            profile = member.profile.toProfileDTO
          )
        case org: Organization =>
          UserDTO(
            id = userId,
            role = role,
            account = UsernameDTO(org.account.username),
            profile = org.profile.toProfileDTO
          )
