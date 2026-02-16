package controller.routes

import application.ports.EventServicePort
import cask.Routes
import domain.commands.{CreateEventCommand, DeleteEventCommand, UpdateEventPosterCommand}
import domain.enums.EventStatus
import middleware.auth.JwtService
import ujson.Obj
import utils.Utils

class DomainEventRoutes(eventService: EventServicePort) extends Routes:

  private val mediaServiceUrl = "http://media:9020"
  private val host            = sys.env.getOrElse("HOST", "localhost")

  @cask.postForm("/")
  def createEvent(poster: cask.FormFile = null, event: String, req: cask.Request): cask.Response[ujson.Value] =
    val authOpt = req.headers.get("authorization").flatMap(_.headOption).flatMap { auth =>
      if auth.startsWith("Bearer ") then Some(auth.drop(7)) else None
    }

    val validationResult = authOpt match
      case Some(token) => JwtService.validateToken(token)
      case None        => Left("No authorization token provided")

    validationResult match
      case Left(error) =>
        cask.Response(
          Obj("error" -> "Unauthorized", "message" -> error),
          statusCode = 401
        )
      case Right(user) =>
        try
          val command: CreateEventCommand = Utils.getCreateCommandFromJson(event)
          val authenticatedUser           = user.userId == command.creatorId
          authenticatedUser match
            case false =>
              cask.Response(
                Obj("error" -> "Forbidden", "message" -> "Creator ID does not match authenticated user"),
                statusCode = 403
              )
            case true =>
              val posterOpt = Option(poster)
              val posterValidation = (command.status, posterOpt) match
                case (status, None) if status != EventStatus.DRAFT =>
                  Left("Poster is required for events with status other than DRAFT")
                case _ =>
                  Right(())

              posterValidation match
                case Left(error) =>
                  cask.Response(
                    Obj("error" -> error),
                    statusCode = 400
                  )
                case Right(_) =>
                  eventService.handleCommand(command) match
                    case Right(eventId: String) =>
                      val posterUrl = Utils.uploadPosterToMediaService(eventId, posterOpt, mediaServiceUrl)
                      val updateCommand =
                        UpdateEventPosterCommand(eventId = eventId, posterUrl = s"http://media.$host/$posterUrl")
                      eventService.handleCommand(updateCommand) match
                        case Right(_) =>
                          cask.Response(
                            Obj("eventId" -> eventId),
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

  @cask.put("/:eventId/")
  def updateEvent(eventId: String, request: cask.Request): cask.Response[ujson.Value] =

    val authOpt = request.headers.get("authorization").flatMap(_.headOption).flatMap { auth =>
      if auth.startsWith("Bearer ") then Some(auth.drop(7)) else None
    }

    val validationResult = authOpt match
      case Some(token) => JwtService.validateToken(token)
      case None        => Left("No authorization token provided")

    validationResult match
      case Left(error) =>
        cask.Response(
          Obj("error" -> "Unauthorized", "message" -> error),
          statusCode = 401
        )
      case Right(user) =>
        try
          val event   = request.text()
          val command = Utils.getUpdateCommandFromJson(eventId, event)

          val authenticatedUser =
            eventService.getEventInfo(eventId) match
              case Left(_) =>
                false
              case Right(event) =>
                user.userId == event.creatorId
          authenticatedUser match
            case false =>
              cask.Response(
                Obj("error" -> "Forbidden", "message" -> "User is not authorized to update this event"),
                statusCode = 403
              )
            case true =>
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

  @cask.delete("/:eventId/")
  def deleteEvent(eventId: String, req: cask.Request): cask.Response[ujson.Value] =
    val authOpt = req.headers.get("authorization").flatMap(_.headOption).flatMap { auth =>
      if auth.startsWith("Bearer ") then Some(auth.drop(7)) else None
    }

    val validationResult = authOpt match
      case Some(token) => JwtService.validateToken(token)
      case None        => Left("No authorization token provided")

    validationResult match
      case Left(error) =>
        cask.Response(
          Obj("error" -> "Unauthorized", "message" -> error),
          statusCode = 401
        )
      case Right(user) =>
        val eventInfoResult = eventService.getEventInfo(eventId)
        val authenticatedUser = eventInfoResult match
          case Left(_) =>
            false
          case Right(event) =>
            user.userId == event.creatorId
        authenticatedUser match
          case false =>
            cask.Response(
              Obj("error" -> "Forbidden", "message" -> "User is not authorized to delete this event"),
              statusCode = 403
            )
          case true =>
            eventService.handleCommand(DeleteEventCommand(eventId)) match
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
