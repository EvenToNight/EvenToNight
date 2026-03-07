package infrastructure.persistence.mongo.repositories

import com.mongodb.client.MongoCollection
import com.mongodb.client.model.Filters
import com.mongodb.client.model.FindOneAndUpdateOptions
import com.mongodb.client.model.ReturnDocument
import com.mongodb.client.model.Updates
import domain.aggregates.Organization
import domain.repository.OrganizationRepository
import infrastructure.persistence.mongo.models.organization.OrganizationDocument

import java.util.ArrayList
import scala.jdk.CollectionConverters._

class MongoOrganizationRepository(
    orgsColl: MongoCollection[OrganizationDocument]
) extends OrganizationRepository:
  override def insert(org: Organization, userId: String) =
    orgsColl.insertOne(OrganizationDocument(userId, org.account, org.profile))

  override def getAllOrganizations() =
    orgsColl.find().into(new ArrayList[OrganizationDocument]()).asScala.toList
      .map(doc => (doc.userId, Organization(doc.account, doc.profile)))

  override def findById(userId: String) =
    Option(orgsColl.find(Filters.eq("_id", userId)).first())
      .map(doc => Organization(doc.account, doc.profile))

  override def delete(userId: String) =
    orgsColl.deleteOne(Filters.eq("_id", userId))

  override def update(updatedOrganization: Organization, userId: String) =
    orgsColl.replaceOne(
      Filters.eq("_id", userId),
      OrganizationDocument(userId, updatedOrganization.account, updatedOrganization.profile)
    )

  override def updateAvatar(userId: String, newAvatar: String) =
    val updated = orgsColl.findOneAndUpdate(
      Filters.eq("_id", userId),
      Updates.set("profile.avatar", newAvatar),
      new FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
    )
    Option(updated).map(doc => Organization(doc.account, doc.profile))

  override def search(prefix: Option[String], limit: Int) =
    val allDocs = orgsColl.find().into(new ArrayList[OrganizationDocument]()).asScala.toList
    val filtered = prefix match
      case Some(p) =>
        val lower = p.toLowerCase
        allDocs.filter { doc =>
          doc.account.username.toLowerCase.startsWith(lower) ||
          doc.profile.name.toLowerCase.startsWith(lower)
        }
      case None => allDocs

    filtered.take(limit).map(doc => (doc.userId, Organization(doc.account, doc.profile)))
