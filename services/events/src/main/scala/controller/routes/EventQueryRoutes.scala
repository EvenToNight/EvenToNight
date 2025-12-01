package controller.routes

import domain.commands.GetAllEventsCommand
import domain.commands.GetEventCommand
import domain.models.Event
import domain.models.EventConversions._
import service.EventService

class EventQueryRoutes(eventService: EventService) extends BaseRoutes:

  @cask.get("/:id_event")
  def getEvent(id_event: String): ujson.Value =
    val command = GetEventCommand(id_event)
    val event = eventService.handleCommand(command) match
      case Right(e: Event) => e
      case _               => Event.nil()

    event.toJson

  @cask.get("/")
  def getAllEvents(): ujson.Value =
    val command = GetAllEventsCommand()
    eventService.handleCommand(command) match
      case Right(list) =>
        list match
          case events: List[?] => ujson.Arr(events.collect { case e: Event => e.toJson })
          case _               => ujson.Arr()
      case Left(_) => ujson.Arr()

  initialize()
