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

trait EventRepository:

  def save(event: Event): Unit
  def findById(id_event: String): Option[Event]

case class MongoEventRepository(connectionString: String, databaseName: String, collectionName: String = "events")
    extends EventRepository:

  private val mongoClient: MongoClient              = MongoClients.create(connectionString)
  private val database: MongoDatabase               = mongoClient.getDatabase(databaseName)
  private val collection: MongoCollection[Document] = database.getCollection(collectionName)

  override def save(event: Event): Unit =
    val replaceOptions = new ReplaceOptions().upsert(true)
    collection.replaceOne(Filters.eq("_id", event._id), event.toDocument, replaceOptions)
    println(s"[MongoDB] Saved Event ID: ${event._id} with status: ${event.status}")

  override def findById(id_event: String): Option[Event] =
    val doc = collection.find(Filters.eq("_id", id_event)).first()
    if doc != null then Some(fromDocument(doc))
    else None

  def close(): Unit =
    mongoClient.close()

case class MockEventRepository() extends EventRepository:
  override def save(event: Event): Unit =
    println(s"[MOCK REPO] Saved Event ID: ${event._id} with status: ${event.status}")

  override def findById(id_event: String): Option[Event] =
    println(s"[MOCK REPO] Finding Event ID: $id_event")
    id_event match
      case "non-existent" => Some(Event.nil())
      case _ =>
        Some(Event(
          _id = id_event,
          title = "Mock Event",
          description = "This is a mock event",
          poster = "mock-poster.jpg",
          tag = List(),
          location = "Mock Location",
          date = java.time.LocalDateTime.now().plusDays(10),
          status = EventStatus.DRAFT,
          instant = java.time.Instant.now(),
          id_creator = "mock-creator",
          id_collaborator = None
        ))
