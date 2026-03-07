package domain.valueobjects

import io.circe.Encoder

sealed trait UserRole
object UserRole:
  case object MemberRole       extends UserRole
  case object OrganizationRole extends UserRole

  given Encoder[UserRole] = Encoder.encodeString.contramap {
    case UserRole.MemberRole       => "member"
    case UserRole.OrganizationRole => "organization"
  }
