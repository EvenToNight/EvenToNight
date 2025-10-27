package infrastructure.db

import domain.Event

import scala.concurrent.Future

trait EventRepository {
  def save(event: Event): Future[Unit]
}

class MockEventRepository extends EventRepository {
  private val store = scala.collection.mutable.Map.empty[String, Event]

  override def save(event: Event): Future[Unit] = {
    println(s"[DB MOCK] Saving Event ID: ${event.id} with status: ${event.status}")
    store.put(event.id, event)
    Future.successful(())
  }

  def getStoreSnapshot: Map[String, Event] = store.toMap
}
