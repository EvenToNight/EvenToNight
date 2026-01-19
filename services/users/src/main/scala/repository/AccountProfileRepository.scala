package repository

import com.mongodb.client.MongoCollection
import com.mongodb.client.model.Filters
import model.UserReferences
import org.bson.types.ObjectId

import java.util.ArrayList
import scala.jdk.CollectionConverters._

trait AccountProfileRepository[A, P]:
  def insert(account: A, profile: P, userId: String): String
  def getAll(): List[(A, P)]
  def findById(userId: String): Option[(A, P)]
  def delete(userId: String): Unit
  def update(account: A, profile: P, userId: String): Unit
  def search(prefix: Option[String], limit: Int, getUsername: A => String, getName: P => String): List[(A, P)]

class MongoAccountProfileRepository[A, P](
    referencesColl: MongoCollection[UserReferences],
    accountsColl: MongoCollection[A],
    profilesColl: MongoCollection[P]
) extends AccountProfileRepository[A, P]:
  override def insert(account: A, profile: P, userId: String) =
    val accountId = accountsColl.insertOne(account).getInsertedId().asObjectId().getValue().toHexString()
    val profileId = profilesColl.insertOne(profile).getInsertedId().asObjectId().getValue().toHexString()
    referencesColl.insertOne(UserReferences(userId, accountId, profileId))
    userId

  override def getAll(): List[(A, P)] =
    val references = referencesColl.find().into(new ArrayList[UserReferences]()).asScala.toList
    references.flatMap(reference =>
      val accountOpt = Option(accountsColl.find(Filters.eq("_id", ObjectId(reference.accountId))).first())
      val profileOpt = Option(profilesColl.find(Filters.eq("_id", ObjectId(reference.profileId))).first())
      for
        account <- accountOpt
        profile <- profileOpt
      yield (account, profile)
    )

  override def findById(userId: String): Option[(A, P)] =
    val referenceOpt = Option(referencesColl.find(Filters.eq("_id", userId)).first())
    referenceOpt.flatMap(reference =>
      val accountOpt = Option(accountsColl.find(Filters.eq("_id", ObjectId(reference.accountId))).first())
      val profileOpt = Option(profilesColl.find(Filters.eq("_id", ObjectId(reference.profileId))).first())
      for
        account <- accountOpt
        profile <- profileOpt
      yield (account, profile)
    )

  override def delete(userId: String) =
    val referenceOpt = Option(referencesColl.find(Filters.eq("_id", userId)).first())
    referenceOpt.foreach(reference =>
      referencesColl.deleteOne(Filters.eq("_id", userId))
      accountsColl.deleteOne(Filters.eq("_id", new ObjectId(reference.accountId)))
      profilesColl.deleteOne(Filters.eq("_id", new ObjectId(reference.profileId)))
    )

  override def update(account: A, profile: P, userId: String) =
    val referenceOpt = Option(referencesColl.find(Filters.eq("_id", userId)).first())
    referenceOpt.foreach(reference =>
      accountsColl.replaceOne(Filters.eq("_id", ObjectId(reference.accountId)), account)
      profilesColl.replaceOne(Filters.eq("_id", ObjectId(reference.profileId)), profile)
    )

  override def search(prefix: Option[String], limit: Int, getUsername: A => String, getName: P => String) =
    val all = getAll()
    val filtered = prefix match
      case Some(p) =>
        val lower = p.toLowerCase
        all.filter { case (account, profile) =>
          getUsername(account).toLowerCase.startsWith(lower) ||
          getName(profile).toLowerCase.startsWith(lower)
        }
      case None => all
    filtered.take(limit)
