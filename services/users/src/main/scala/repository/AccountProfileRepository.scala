package repository

import com.mongodb.client.MongoCollection
import model.ForeignKeys

trait AccountProfileRepository[A, P]:
  def insert(account: A, profile: P): String

class MongoAccountProfileRepository[A, P](
    usersColl: MongoCollection[ForeignKeys],
    accountsColl: MongoCollection[A],
    profilesColl: MongoCollection[P]
) extends AccountProfileRepository[A, P]:
  override def insert(account: A, profile: P) =
    val accountId = accountsColl.insertOne(account).getInsertedId().asObjectId().getValue().toHexString()
    val profileId = profilesColl.insertOne(profile).getInsertedId().asObjectId().getValue().toHexString()
    val userId =
      usersColl.insertOne(ForeignKeys(accountId, profileId)).getInsertedId().asObjectId().getValue().toHexString()
    userId
