package model.organization

import infrastructure.Wiring.mediaBaseUrl

case class OrganizationProfile(
    name: String,
    avatar: String = s"http://${mediaBaseUrl}/users/default.png",
    bio: Option[String] = None,
    contacts: Option[List[String]] = None
)
