package presentation.http.mappers

import domain.valueobjects.member.MemberProfile
import domain.valueobjects.organization.OrganizationProfile
import presentation.http.dto.response.user.ProfileDTO

object ProfileMappers:
  extension (profile: MemberProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name,
        avatar = profile.avatar,
        bio = profile.bio,
        contacts = None
      )

  extension (profile: OrganizationProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name,
        avatar = profile.avatar,
        bio = profile.bio,
        contacts = profile.contacts
      )
