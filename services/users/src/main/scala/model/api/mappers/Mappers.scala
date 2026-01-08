package model.api.mappers

import model.Member
import model.Organization
import model.RegisteredUser
import model.api.dto.AccountDTO
import model.api.dto.LoginResponseDTO
import model.api.dto.ProfileDTO
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

object Mappers:
  extension (account: MemberAccount)
    def toAccountDTO: AccountDTO =
      AccountDTO(
        username = account.username,
        email = account.email
      )

  extension (account: OrganizationAccount)
    def toAccountDTO: AccountDTO =
      AccountDTO(
        username = account.username,
        email = account.email
      )

  extension (profile: MemberProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name
      )

  extension (profile: OrganizationProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name
      )

  extension (user: RegisteredUser)
    def toLoginDTO(accessToken: String, refreshToken: String): LoginResponseDTO =
      user match
        case member: Member =>
          LoginResponseDTO(
            accessToken = accessToken,
            refreshToken = refreshToken,
            account = member.account.toAccountDTO,
            profile = member.profile.toProfileDTO
          )
        case org: Organization =>
          LoginResponseDTO(
            accessToken = accessToken,
            refreshToken = refreshToken,
            account = org.account.toAccountDTO,
            profile = org.profile.toProfileDTO
          )
