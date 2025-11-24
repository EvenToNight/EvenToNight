package controller.routes

import domain.commands.GetEventCommand
import domain.models.EventConversions._
import service.EventService

class EventQueryApi(eventService: EventService) extends BaseRoutes:

  @cask.get("/event/:id_event")
  def getEvent(id_event: String): ujson.Value =
    val command = GetEventCommand(id_event)
    val event   = eventService.handleCommand(command)

    event.toJson

  initialize()
