package fixtures

import model.Organization
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

object OrganizationFixtures:
  val organizationUserId: String = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  private val keycloakId: String = "7e63d360-5e3d-4b33-8c9a-a8c2d773db2c"
  private val email: String      = "info@meet.com"
  private val nickname: String   = "Meet"
  val organization: Organization =
    Organization(OrganizationAccount(keycloakId, email), OrganizationProfile(nickname))
