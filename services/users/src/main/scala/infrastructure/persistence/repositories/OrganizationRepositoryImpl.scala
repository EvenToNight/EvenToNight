package infrastructure.persistence.repositories

import domain.aggregates.Organization
import domain.repository.AccountProfileRepository
import domain.repository.OrganizationRepository
import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile

class OrganizationRepositoryImpl(
    orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile]
) extends OrganizationRepository:
  override def insert(org: Organization, userId: String) =
    orgAccountProfileRepo.insert(org.account, org.profile, userId)

  override def getAllOrganizations() =
    orgAccountProfileRepo.getAll().map { case (userId, account, profile) =>
      (userId, Organization(account, profile))
    }

  override def findById(userId: String) =
    orgAccountProfileRepo.findById(userId) match
      case Some((account, profile)) => Some(Organization(account, profile))
      case None                     => None

  override def delete(userId: String) =
    orgAccountProfileRepo.delete(userId)

  override def update(updatedOrg: Organization, userId: String) =
    orgAccountProfileRepo.update(updatedOrg.account, updatedOrg.profile, userId)

  override def updateAvatar(userId: String, newAvatar: String) =
    orgAccountProfileRepo.updateProfileAvatar(userId, newAvatar) match
      case Some((account, profile)) => Some(Organization(account, profile))
      case None                     => None

  override def search(prefix: Option[String], limit: Int) =
    orgAccountProfileRepo.search(
      prefix,
      limit,
      getUsername = _.username,
      getName = _.name
    ).map { case (userId, account, profile) => (userId, Organization(account, profile)) }
