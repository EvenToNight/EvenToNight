package infrastructure.db

import com.mongodb.client.{MongoClient, MongoClients, MongoCollection, MongoDatabase}
import com.mongodb.client.model.{Filters, ReplaceOptions}
import domain.models.{Event, EventStatus}
import domain.models.EventConversions.{fromDocument, toDocument}
import org.bson.Document
import utils.Utils

import scala.jdk.CollectionConverters.*
import scala.util.{Failure, Success, Try}

trait EventRepository:

  def save(event: Event): Either[Throwable, Unit]
  def findById(id_event: String): Option[Event]
  def update(event: Event): Either[Throwable, Unit]
  def findAllPublished(): Either[Throwable, List[Event]]
  def delete(id_event: String): Either[Throwable, Unit]
  def findByFilters(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[EventStatus] = None,
      title: Option[String] = None,
      tags: Option[List[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      id_organization: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None
  ): Either[Throwable, List[Event]]

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

  override def findByFilters(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[EventStatus] = None,
      title: Option[String] = None,
      tags: Option[List[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      id_organization: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None
  ): Either[Throwable, List[Event]] =
    Try {
      val filters = scala.collection.mutable.ListBuffer.empty[org.bson.conversions.Bson]

      status.foreach(s => filters += Filters.eq("status", s.toString))
      title.foreach(n => filters += Filters.regex("title", n, "i"))
      id_organization.foreach(org => filters += Filters.eq("id_organization", org))
      city.foreach(c => filters += Filters.regex("location.city", c, "i"))
      location_name.foreach(loc => filters += Filters.regex("location.name", loc, "i"))

      tags.foreach { tagList =>
        if tagList.nonEmpty then
          filters += Filters.in("tags", tagList.asJava)
      }

      startDate.foreach(start => filters += Filters.gte("date", start))
      endDate.foreach(end => filters += Filters.lte("date", end))

      val combinedFilter = if filters.isEmpty then
        new Document()
      else if filters.size == 1 then
        filters.head
      else
        Filters.and(filters.asJava)

      var query = collection.find(combinedFilter)

      offset.foreach(o => query = query.skip(o))
      limit.foreach(l => query = query.limit(l))

      query
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
      println(s"[MongoDB][Error] Failed to retrieve filtered events - ${ex.getMessage}")
      ex
    }

  def close(): Unit =
    mongoClient.close()
