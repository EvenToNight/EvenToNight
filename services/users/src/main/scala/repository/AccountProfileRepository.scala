package repository

import com.mongodb.client.MongoCollection

trait AccountProfileRepository[A, P]:
  def insert(account: A, profile: P): Unit

class MongoAccountProfileRepository[A, P](
    accountsColl: MongoCollection[A],
    profilesColl: MongoCollection[P]
) extends AccountProfileRepository[A, P]:
  override def insert(account: A, profile: P) =
    accountsColl.insertOne(account)
    profilesColl.insertOne(profile)
