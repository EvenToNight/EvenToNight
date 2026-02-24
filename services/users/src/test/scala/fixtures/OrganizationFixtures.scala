package fixtures

import domain.aggregates.Organization
import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile

object OrganizationFixtures:
  val organizationUserId: String = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  private val username: String   = "Meet"
  private val email: String      = "info@meet.com"
  private val avatar: String     = "default.jpg"
  val organization: Organization =
    Organization(OrganizationAccount(username, email), OrganizationProfile(username, avatar))
