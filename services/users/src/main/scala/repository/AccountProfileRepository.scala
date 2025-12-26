package repository

import com.mongodb.client.MongoCollection
import model.ForeignKeys

trait AccountProfileRepository[A, P]:
  def insert(account: A, profile: P, userId: String): String

class MongoAccountProfileRepository[A, P](
    foreignKeysColl: MongoCollection[ForeignKeys],
    accountsColl: MongoCollection[A],
    profilesColl: MongoCollection[P]
) extends AccountProfileRepository[A, P]:
  override def insert(account: A, profile: P, userId: String) =
    val accountId = accountsColl.insertOne(account).getInsertedId().asObjectId().getValue().toHexString()
    val profileId = profilesColl.insertOne(profile).getInsertedId().asObjectId().getValue().toHexString()
    foreignKeysColl.insertOne(ForeignKeys(userId, accountId, profileId))
    userId
