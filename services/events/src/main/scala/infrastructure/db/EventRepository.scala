package infrastructure.db

import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters
import com.mongodb.client.model.ReplaceOptions
import domain.models.Event
import domain.models.EventConversions.fromDocument
import domain.models.EventConversions.toDocument
import domain.models.EventStatus
import org.bson.Document
import utils.Utils

import scala.jdk.CollectionConverters._
import scala.util.Failure
import scala.util.Success
import scala.util.Try

trait EventRepository:

  def save(event: Event): Either[Throwable, Unit]
  def findById(id_event: String): Option[Event]
  def update(event: Event): Either[Throwable, Unit]
  def findAllPublished(): Either[Throwable, List[Event]]
  def delete(id_event: String): Either[Throwable, Unit]

case class MongoEventRepository(connectionString: String, databaseName: String, collectionName: String = "events")
    extends EventRepository:

  private val mongoClient: MongoClient              = MongoClients.create(connectionString)
  private val database: MongoDatabase               = mongoClient.getDatabase(databaseName)
  private val collection: MongoCollection[Document] = database.getCollection(collectionName)

  override def save(event: Event): Either[Throwable, Unit] =
    val replaceOptions = new ReplaceOptions().upsert(true)

    Try {
      collection.replaceOne(Filters.eq("_id", event._id), event.toDocument, replaceOptions)
      println(s"[MongoDB] Saved Event ID: ${event._id} with status: ${event.status}")
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to save Event ID: ${event._id} - ${ex.getMessage}")
        Left(ex)

  override def findById(id_event: String): Option[Event] =
    val doc = collection.find(Filters.eq("_id", id_event)).first()
    if doc != null then
      val event        = fromDocument(doc)
      val updatedEvent = Utils.updateEventIfPastDate(event)
      if updatedEvent.status != event.status then
        update(updatedEvent).left.foreach(ex =>
          println(s"[MongoDB] Could not auto-update past event to COMPLETED: ${ex.getMessage}")
        )
      Some(updatedEvent)
    else None

  override def update(event: Event): Either[Throwable, Unit] =
    Try {
      val replaceOptions = new ReplaceOptions().upsert(false)
      collection.replaceOne(Filters.eq("_id", event._id), event.toDocument, replaceOptions)
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to update Event ID: ${event._id} - ${ex.getMessage}")
        Left(ex)

  override def findAllPublished(): Either[Throwable, List[Event]] =
    Try {
      collection
        .find(Filters.eq("status", EventStatus.PUBLISHED.toString))
        .into(new java.util.ArrayList[Document]())
        .asScala
        .map(fromDocument)
        .map { event =>
          val updatedEvent = Utils.updateEventIfPastDate(event)
          if updatedEvent.status != event.status then
            update(updatedEvent).left.foreach(ex =>
              println(s"[MongoDB] Could not auto-update past event to COMPLETED: ${ex.getMessage}")
            )
          updatedEvent
        }
        .toList
    }.toEither.left.map { ex =>
      println(s"[MongoDB][Error] Failed to retrieve published events - ${ex.getMessage}")
      ex
    }

  override def delete(id_event: String): Either[Throwable, Unit] =
    Try {
      collection.deleteOne(Filters.eq("_id", id_event))
      println(s"[MongoDB] Deleted Event ID: $id_event")
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to delete Event ID: $id_event -" + s" ${ex.getMessage}")
        Left(ex)

  def close(): Unit =
    mongoClient.close()
