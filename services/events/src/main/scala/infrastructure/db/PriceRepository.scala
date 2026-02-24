package infrastructure.db

import com.mongodb.client.{MongoClient, MongoClients, MongoCollection, MongoDatabase}
import com.mongodb.client.model.{Filters, ReplaceOptions}
import infrastructure.dto.TicketPrice
import infrastructure.messaging.EventPublisher
import org.bson.Document

import scala.util.{Failure, Success, Try}

trait PriceRepository:
  def save(ticketPrice: TicketPrice): Either[Throwable, Unit]
  def findByTicketTypeId(ticketTypeId: String): Option[TicketPrice]
  def findByEventId(eventId: String): List[TicketPrice]
  def findByEventIds(eventIds: List[String]): Map[String, List[TicketPrice]]
  def findEventIdsInPriceRange(limit: Int, minPrice: Double, maxPrice: Double): List[String]
  def delete(ticketTypeId: String): Either[Throwable, Unit]

case class MongoPriceRepository(
    connectionString: String,
    databaseName: String,
    collectionName: String = "prices",
    messageBroker: EventPublisher
) extends PriceRepository:

  private val mongoClient: MongoClient              = MongoClients.create(connectionString)
  private val database: MongoDatabase               = mongoClient.getDatabase(databaseName)
  private val collection: MongoCollection[Document] = database.getCollection(collectionName)

  def save(ticketPrice: TicketPrice): Either[Throwable, Unit] =
    val replaceOptions = new ReplaceOptions().upsert(true)

    Try {
      collection.replaceOne(
        Filters.eq("ticketTypeId", ticketPrice.ticketTypeId),
        ticketPrice.toDocument,
        replaceOptions
      )
      println(
        s"[MongoDB] Saved Ticket Price for ticketTypeId: ${ticketPrice.ticketTypeId}, eventId: ${ticketPrice.eventId}, price: ${ticketPrice.price}"
      )
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to save Ticket Price: ${ex.getMessage}")
        Left(ex)

  def findByTicketTypeId(ticketTypeId: String): Option[TicketPrice] =
    val docOption = Option(collection.find(Filters.eq("ticketTypeId", ticketTypeId)).first())
    docOption.map(TicketPrice.fromDocument)

  def findByEventId(eventId: String): List[TicketPrice] =
    import scala.jdk.CollectionConverters.*
    Try {
      collection
        .find(Filters.eq("eventId", eventId))
        .into(new java.util.ArrayList[Document]())
        .asScala
        .map(TicketPrice.fromDocument)
        .toList
    }.getOrElse(List.empty)

  def findByEventIds(eventIds: List[String]): Map[String, List[TicketPrice]] =
    import scala.jdk.CollectionConverters.*
    if eventIds.isEmpty then
      Map.empty
    else
      Try {
        val prices = collection
          .find(Filters.in("eventId", eventIds.asJava))
          .into(new java.util.ArrayList[Document]())
          .asScala
          .map(TicketPrice.fromDocument)
          .toList
        prices.groupBy(_.eventId)
      }.getOrElse(Map.empty)

  def findEventIdsInPriceRange(limit: Int, minPrice: Double, maxPrice: Double): List[String] =
    import scala.jdk.CollectionConverters.*
    Try {
      val priceFilter = Filters.and(
        Filters.gte("price", minPrice),
        Filters.lte("price", maxPrice)
      )
      collection
        .find(priceFilter)
        .limit(limit)
        .into(new java.util.ArrayList[Document]())
        .asScala
        .map(doc => doc.getString("eventId"))
        .toList
        .distinct
    }.getOrElse(List.empty)

  def delete(ticketTypeId: String): Either[Throwable, Unit] =
    Try {
      collection.deleteOne(Filters.eq("ticketTypeId", ticketTypeId))
      println(s"[MongoDB] Deleted Ticket Price for ticketTypeId: $ticketTypeId")
    } match
      case Success(_) => Right(())
      case Failure(ex) =>
        println(s"[MongoDB][Error] Failed to delete Ticket Price: ${ex.getMessage}")
        Left(ex)
