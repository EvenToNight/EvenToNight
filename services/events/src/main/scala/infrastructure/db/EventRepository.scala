package infrastructure.db

import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters
import com.mongodb.client.model.ReplaceOptions
import domain.Event
import org.bson.Document

trait EventRepository {
  def save(event: Event): Unit
}

case class MongoEventRepository(connectionString: String, databaseName: String, collectionName: String = "events")
    extends EventRepository {

  private val mongoClient: MongoClient              = MongoClients.create(connectionString)
  private val database: MongoDatabase               = mongoClient.getDatabase(databaseName)
  private val collection: MongoCollection[Document] = database.getCollection(collectionName)

  override def save(event: Event): Unit = {
    val replaceOptions = new ReplaceOptions().upsert(true)
    collection.replaceOne(Filters.eq("_id", event._id), event.toDocument, replaceOptions)
    println(s"[MongoDB] Saved Event ID: ${event._id} with status: ${event.status}")
  }

  def close(): Unit = {
    mongoClient.close()
  }

}
