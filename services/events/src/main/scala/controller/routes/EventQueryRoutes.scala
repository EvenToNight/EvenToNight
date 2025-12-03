package controller.routes

import domain.commands.GetAllEventsCommand
import domain.commands.GetEventCommand
import domain.models.Event
import domain.models.EventConversions._
import service.EventService

class EventQueryRoutes(eventService: EventService) extends BaseRoutes:

  @cask.get("/:id_event")
  def getEvent(id_event: String): cask.Response[ujson.Value] =
    val command = GetEventCommand(id_event)
    eventService.handleCommand(command) match
      case Right(e: Event) =>
        cask.Response(e.toJson, statusCode = 200)
      case Left(error) =>
        cask.Response(
          ujson.Obj("error" -> s"Event not found: $error"),
          statusCode = 404
        )
      case _ =>
        cask.Response(
          ujson.Obj("error" -> "Event not found"),
          statusCode = 404
        )

  @cask.get("/")
  def getAllEvents(): cask.Response[ujson.Value] =
    val command = GetAllEventsCommand()
    eventService.handleCommand(command) match
      case Right(list) =>
        list match
          case events: List[?] =>
            cask.Response(ujson.Arr(events.collect { case e: Event => e.toJson }), statusCode = 200)
          case _ => cask.Response(ujson.Arr(), statusCode = 200)
      case Left(errors) =>
        cask.Response(
          ujson.Obj("error" -> s"Could not retrieve events $errors"),
          statusCode = 404
        )

  initialize()
