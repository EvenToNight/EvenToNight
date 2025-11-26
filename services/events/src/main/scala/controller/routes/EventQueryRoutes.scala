package controller.routes

import domain.commands.GetEventCommand
import domain.models.Event
import domain.models.EventConversions._
import service.EventService

class EventQueryRoutes(eventService: EventService) extends BaseRoutes:

  @cask.get("/event/:id_event")
  def getEvent(id_event: String): ujson.Value =
    val command = GetEventCommand(id_event)
    val event = eventService.handleCommand(command) match
      case Right(e: Event) => e
      case _               => Event.nil()

    event.toJson

  initialize()
