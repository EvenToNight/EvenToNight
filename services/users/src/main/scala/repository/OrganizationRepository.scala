package repository

import com.mongodb.client.MongoCollection
import model.Organization
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

trait OrganizationRepository:
  def insert(org: Organization): Unit

class MongoOrganizationRepository(
    orgAccountsColl: MongoCollection[OrganizationAccount],
    orgProfilesColl: MongoCollection[OrganizationProfile]
) extends OrganizationRepository:
  override def insert(org: Organization) =
    orgAccountsColl.insertOne(org.account)
    orgProfilesColl.insertOne(org.profile)
