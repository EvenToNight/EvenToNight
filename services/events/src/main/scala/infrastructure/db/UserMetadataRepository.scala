package infrastructure.db

import com.mongodb.client.{MongoClient, MongoClients, MongoCollection, MongoDatabase}
import com.mongodb.client.model.{Filters, ReplaceOptions}
import domain.models.UserMetadata
import infrastructure.messaging.EventPublisher
import org.bson.Document

import scala.util.{Failure, Success, Try}

trait UserMetadataRepository:
  def save(user: UserMetadata): Either[Throwable, Unit]
  def findById(id: String): Option[UserMetadata]
  def delete(id: String): Either[Throwable, Unit]

case class MongoUserMetadataRepository(
    connectionString: String,
    databaseName: String,
    collectionName: String = "users",
    messageBroker: EventPublisher
) extends UserMetadataRepository:

  private val mongoClient: MongoClient              = MongoClients.create(connectionString)
  private val database: MongoDatabase               = mongoClient.getDatabase(databaseName)
  private val collection: MongoCollection[Document] = database.getCollection(collectionName)

  def save(user: UserMetadata): Either[Throwable, Unit] =
    val replaceOptions = new ReplaceOptions().upsert(true)

    Try {
      collection.replaceOne(Filters.eq("_id", user.id), user.toDocument, replaceOptions)
      println(s"[MongoDB] Saved User ID: ${user.id} with role: ${user.role}")
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to save User ID: ${user.id} - ${ex.getMessage}")
        Left(ex)

  def findById(id: String): Option[UserMetadata] =
    val docOption = Option(collection.find(Filters.eq("_id", id)).first())
    docOption.map(UserMetadata.fromDocument)

  def delete(id: String): Either[Throwable, Unit] =
    Try {
      collection.deleteOne(Filters.eq("_id", id))
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to delete User ID: $id - ${ex.getMessage}")
        Left(ex)
