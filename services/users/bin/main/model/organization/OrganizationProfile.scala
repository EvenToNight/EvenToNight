package model.organization

case class OrganizationProfile(nickname: String)

object OrganizationProfile:
  val default: OrganizationProfile = OrganizationProfile(nickname = "")
