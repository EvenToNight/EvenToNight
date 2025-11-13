package repository

import model.Organization
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

trait OrganizationRepository:
  def insert(org: Organization): Unit

class MongoOrganizationRepository(
    orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile]
) extends OrganizationRepository:
  override def insert(org: Organization) =
    orgAccountProfileRepo.insert(org.account, org.profile)
