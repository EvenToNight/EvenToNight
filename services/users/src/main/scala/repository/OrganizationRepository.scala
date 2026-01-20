package repository

import model.Organization
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

trait OrganizationRepository:
  def insert(org: Organization, userId: String): String
  def getAllOrganizations(): List[(String, Organization)]
  def findById(userId: String): Option[Organization]
  def delete(userId: String): Unit
  def update(updatedOrg: Organization, userId: String): Unit
  def search(prefix: Option[String], limit: Int): List[(String, Organization)]

class MongoOrganizationRepository(
    orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile]
) extends OrganizationRepository:
  override def insert(org: Organization, userId: String) =
    orgAccountProfileRepo.insert(org.account, org.profile, userId)

  override def getAllOrganizations() =
    orgAccountProfileRepo.getAll().map { case (userId, account, profile) =>
      (userId, Organization(account, profile))
    }

  override def findById(userId: String): Option[Organization] =
    orgAccountProfileRepo.findById(userId) match
      case Some((account, profile)) => Some(Organization(account, profile))
      case None                     => None

  override def delete(userId: String) =
    orgAccountProfileRepo.delete(userId)

  override def update(updatedOrg: Organization, userId: String) =
    orgAccountProfileRepo.update(updatedOrg.account, updatedOrg.profile, userId)

  override def search(prefix: Option[String], limit: Int) =
    orgAccountProfileRepo.search(
      prefix,
      limit,
      getUsername = _.username,
      getName = _.name
    ).map { case (userId, account, profile) => (userId, Organization(account, profile)) }
