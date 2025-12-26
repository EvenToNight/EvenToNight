package repository

import model.Organization
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

trait OrganizationRepository:
  def insert(org: Organization, userId: String): String

class MongoOrganizationRepository(
    orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile]
) extends OrganizationRepository:
  override def insert(org: Organization, userId: String) =
    orgAccountProfileRepo.insert(org.account, org.profile, userId)
