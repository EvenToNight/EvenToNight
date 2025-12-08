package controller.routes

import domain.commands.{DeleteEventCommand, UpdateEventPosterCommand}
import service.EventService
import ujson.Obj
import utils.Utils

class DomainEventRoutes(eventService: EventService) extends BaseRoutes:

  private val mediaServiceUrl = "http://media:9020"

  @cask.postForm("/")
  def createEvent(poster: cask.FormFile, event: String): cask.Response[ujson.Value] =
    try
      val command = Utils.getCreateCommandFromJson(event)

      eventService.handleCommand(command) match
        case Right(id_event: String) =>
          val posterUrl     = Utils.uploadPosterToMediaService(id_event, poster, mediaServiceUrl)
          val updateCommand = UpdateEventPosterCommand(id_event = id_event, posterUrl = posterUrl)
          eventService.handleCommand(updateCommand) match
            case Right(_) =>
              cask.Response(
                Obj("id_event" -> id_event),
                statusCode = 201
              )
            case Left(error) =>
              cask.Response(
                Obj("error" -> s"Event created but poster upload failed: $error"),
                statusCode = 207
              )
        case Left(value) =>
          cask.Response(
            Obj("error" -> value),
            statusCode = 400
          )
        case _ =>
          cask.Response(
            Obj("error" -> "Unknown error occurred during event creation"),
            statusCode = 500
          )
    catch
      case e: ujson.ParseException =>
        cask.Response(
          Obj("error" -> s"Invalid JSON format: ${e.getMessage}"),
          statusCode = 400
        )
      case e: Exception =>
        cask.Response(
          Obj("error" -> s"Invalid request: ${e.getMessage}"),
          statusCode = 400
        )

  @cask.put("/:id_event/")
  def updateEvent(id_event: String, request: cask.Request): cask.Response[ujson.Value] =
    try
      val event   = request.text()
      val command = Utils.getUpdateCommandFromJson(id_event, event)

      eventService.handleCommand(command) match
        case Right(_) =>
          cask.Response(
            Obj("message" -> "Event updated successfully"),
            statusCode = 200
          )
        case Left(value) =>
          cask.Response(
            Obj("error" -> value),
            statusCode = 400
          )
    catch
      case e: ujson.ParseException =>
        cask.Response(
          Obj("error" -> s"Invalid JSON format: ${e.getMessage}"),
          statusCode = 400
        )
      case e: Exception =>
        cask.Response(
          Obj("error" -> s"Invalid request: ${e.getMessage}"),
          statusCode = 400
        )

  @cask.delete("/:id_event/")
  def deleteEvent(id_event: String): cask.Response[ujson.Value] =
    eventService.handleCommand(DeleteEventCommand(id_event)) match
      case Right(_) =>
        cask.Response(
          Obj("message" -> "Event deleted successfully"),
          statusCode = 200
        )
      case Left(value) =>
        cask.Response(
          Obj("error" -> value),
          statusCode = 400
        )

  initialize()
