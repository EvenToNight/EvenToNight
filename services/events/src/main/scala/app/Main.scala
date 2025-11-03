package app

import controller.EventController
import infrastructure.db.MockEventRepository
import infrastructure.messaging.MockEventPublisher
import service.EventService

object Main extends App {

  val database      = new MockEventRepository()
  val messageBroker = new MockEventPublisher()

  val eventService = new EventService(database, messageBroker)

  val controller = new EventController(eventService)

  controller.main(Array())

}
