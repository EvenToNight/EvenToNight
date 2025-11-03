package infrastructure.db

import domain.Event

trait EventRepository {
  def save(event: Event): Unit
}

class MockEventRepository extends EventRepository {
  private val store = scala.collection.mutable.Map.empty[String, Event]

  override def save(event: Event): Unit =
    println(s"[DB MOCK] Saving Event ID: ${event.id} with status: ${event.status}")
    store.put(event.id, event)
}
