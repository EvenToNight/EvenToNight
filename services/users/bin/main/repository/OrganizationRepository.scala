package repository

import model.Organization
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

trait OrganizationRepository:
  def insert(org: Organization, userId: String): String
  def getAllOrganizations(): List[Organization]
  def findById(userId: String): Option[Organization]

class MongoOrganizationRepository(
    orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile]
) extends OrganizationRepository:
  override def insert(org: Organization, userId: String) =
    orgAccountProfileRepo.insert(org.account, org.profile, userId)

  override def getAllOrganizations(): List[Organization] =
    orgAccountProfileRepo.getAll().map { case (account, profile) =>
      Organization(account, profile)
    }

  override def findById(userId: String): Option[Organization] =
    orgAccountProfileRepo.findById(userId) match
      case Some((account, profile)) => Some(Organization(account, profile))
      case None                     => None
