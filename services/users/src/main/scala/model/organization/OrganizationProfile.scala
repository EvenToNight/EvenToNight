package model.organization

import infrastructure.Wiring.mediaBaseUrl
import io.circe.Encoder
import io.circe.generic.semiauto._

case class OrganizationProfile(
    name: String,
    avatar: String = s"http://${mediaBaseUrl}/users/default.png",
    bio: Option[String] = None,
    contacts: Option[List[String]] = None
)

object OrganizationProfile:
  given Encoder[OrganizationProfile] = deriveEncoder[OrganizationProfile].mapJson(_.dropNullValues)
