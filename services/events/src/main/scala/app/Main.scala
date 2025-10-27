package app

import controller.EventController
import infrastructure.db.MockEventRepository
import infrastructure.messaging.MockEventPublisher
import service.EventService

import scala.concurrent.ExecutionContext.Implicits.global

object Main extends App {

  val repo      = new MockEventRepository()
  val publisher = new MockEventPublisher()

  val eventService = new EventService(repo, publisher)

  val controller = new EventController(eventService)

  controller.main(Array())

}
