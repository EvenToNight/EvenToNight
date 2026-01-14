package model.organization

case class OrganizationProfile(
    name: String,
    avatar: String = "",
    bio: Option[String] = None,
    contacts: Option[List[String]] = None
)
