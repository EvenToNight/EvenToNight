package repository

import com.mongodb.client.MongoCollection
import model.UserReferences

trait AccountProfileRepository[A, P]:
  def insert(account: A, profile: P, userId: String): String

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
