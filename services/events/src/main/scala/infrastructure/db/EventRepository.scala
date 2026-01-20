package infrastructure.db

import com.mongodb.client.{MongoClient, MongoClients, MongoCollection, MongoDatabase}
import com.mongodb.client.model.{Filters, ReplaceOptions, Sorts}
import domain.events.EventCompleted
import domain.models.{Event, EventStatus}
import domain.models.EventConversions.{fromDocument, toDocument}
import infrastructure.messaging.EventPublisher
import org.bson.Document
import utils.Utils

import scala.jdk.CollectionConverters.*
import scala.util.{Failure, Success, Try}

trait EventRepository:

  def save(event: Event): Either[Throwable, Unit]
  def findById(eventId: String): Option[Event]
  def update(event: Event): Either[Throwable, Unit]
  def findAllPublished(): Either[Throwable, List[Event]]
  def delete(eventId: String): Either[Throwable, Unit]
  def findByFilters(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[EventStatus] = None,
      title: Option[String] = None,
      tags: Option[List[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      organizationId: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None,
      priceRange: Option[(Double, Double)] = None,
      sortBy: Option[String] = None,
      sortOrder: Option[String] = None
  ): Either[Throwable, (List[Event], Boolean)]

case class MongoEventRepository(
    connectionString: String,
    databaseName: String,
    collectionName: String = "events",
    messageBroker: EventPublisher
) extends EventRepository:

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

  override def findById(eventId: String): Option[Event] =
    val doc = collection.find(Filters.eq("_id", eventId)).first()
    if doc != null then
      val event        = fromDocument(doc)
      val updatedEvent = Utils.updateEventIfPastDate(event)
      if updatedEvent.status != event.status then
        update(updatedEvent).left.foreach(ex =>
          println(s"[MongoDB] Could not auto-update past event to COMPLETED: ${ex.getMessage}")
        )
        publishEventCompletedIfNeeded(updatedEvent, event)
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
        .sort(Sorts.ascending("date"))
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

  override def delete(eventId: String): Either[Throwable, Unit] =
    Try {
      collection.deleteOne(Filters.eq("_id", eventId))
      println(s"[MongoDB] Deleted Event ID: $eventId")
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to delete Event ID: $eventId -" + s" ${ex.getMessage}")
        Left(ex)

  override def findByFilters(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[EventStatus] = None,
      title: Option[String] = None,
      tags: Option[List[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      organizationId: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None,
      priceRange: Option[(Double, Double)] = None,
      sortBy: Option[String] = None,
      sortOrder: Option[String] = None
  ): Either[Throwable, (List[Event], Boolean)] =
    Try {

      val combinedFilter =
        buildFilterQuery(status, title, tags, startDate, endDate, organizationId, city, location_name, priceRange)

      val sortField     = sortBy.getOrElse("date")
      val sortDirection = if sortOrder.contains("desc") then -1 else 1

      val sortCriteria = if sortField == "date" then
        Sorts.orderBy(Sorts.descending("date"))
      else
        Sorts.orderBy(
          if sortDirection == 1 then Sorts.ascending(sortField) else Sorts.descending(sortField),
          Sorts.ascending("date")
        )

      val query = applyPagination(collection.find(combinedFilter).sort(sortCriteria), offset, limit)

      val results = executeQueryAndUpdateEvents(query)

      calculateHasMore(results, limit)
    }.toEither.left.map { ex =>
      println(s"[MongoDB][Error] Failed to retrieve filtered events - ${ex.getMessage}")
      ex
    }

  def close(): Unit =
    mongoClient.close()

  private def buildFilterQuery(
      status: Option[EventStatus],
      title: Option[String],
      tags: Option[List[String]],
      startDate: Option[String],
      endDate: Option[String],
      organizationId: Option[String],
      city: Option[String],
      location_name: Option[String],
      priceRange: Option[(Double, Double)]
  ): org.bson.conversions.Bson =
    val filters = scala.collection.mutable.ListBuffer.empty[org.bson.conversions.Bson]

    status.foreach(s => filters += Filters.eq("status", s.toString))
    title.foreach(t => filters += Filters.regex("title", escapeRegex(t), "i"))
    organizationId.foreach { org =>
      filters += Filters.or(
        Filters.eq("creatorId", org),
        Filters.eq("collaboratorIds", org)
      )
    }
    city.foreach(c => filters += Filters.regex("location.city", escapeRegex(c), "i"))
    location_name.foreach(loc => filters += Filters.regex("location.name", escapeRegex(loc), "i"))

    tags.foreach { tagList =>
      if tagList.nonEmpty then
        filters += Filters.in("tags", tagList.asJava)
    }

    startDate.foreach(start => filters += Filters.gte("date", start))
    endDate.foreach(end => filters += Filters.lte("date", end))

    priceRange.foreach { case (min, max) =>
      filters += Filters.and(
        Filters.gte("price", min),
        Filters.lte("price", max)
      )
    }
    if filters.isEmpty then
      new Document()
    else if filters.size == 1 then
      filters.head
    else
      Filters.and(filters.asJava)

  private def escapeRegex(str: String): String =
    str.replaceAll("([\\[\\]\\(\\)\\{\\}\\*\\+\\?\\|\\^\\$\\.\\\\/])", "\\\\$1")

  private def applyPagination(
      query: com.mongodb.client.FindIterable[Document],
      offset: Option[Int],
      limit: Option[Int]
  ): com.mongodb.client.FindIterable[Document] =
    var paginatedQuery = query
    offset.foreach(o => paginatedQuery = paginatedQuery.skip(o))
    limit.map(_ + 1).foreach(l => paginatedQuery = paginatedQuery.limit(l))
    paginatedQuery

  private def executeQueryAndUpdateEvents(
      query: com.mongodb.client.FindIterable[Document]
  ): List[Event] =
    query
      .into(new java.util.ArrayList[Document]())
      .asScala
      .map(fromDocument)
      .map(updateEventIfPast)
      .toList

  private def updateEventIfPast(event: Event): Event =
    val updatedEvent = Utils.updateEventIfPastDate(event)
    if updatedEvent.status != event.status then
      update(updatedEvent).left.foreach(ex =>
        println(s"[MongoDB] Could not auto-update past event to COMPLETED: ${ex.getMessage}")
      )
      publishEventCompletedIfNeeded(updatedEvent, event)
    updatedEvent

  private def publishEventCompletedIfNeeded(updatedEvent: Event, originalEvent: Event): Unit =
    if updatedEvent.status == EventStatus.COMPLETED && originalEvent.status != EventStatus.COMPLETED then
      messageBroker.publish(EventCompleted(eventId = updatedEvent._id))
      println(s"[RABBITMQ] Published EventCompleted for event: ${updatedEvent._id}")

  private def calculateHasMore(results: List[Event], limit: Option[Int]): (List[Event], Boolean) =
    limit match
      case Some(lim) if results.size > lim => (results.take(lim), true)
      case _                               => (results, false)
