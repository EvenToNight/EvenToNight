package controller.routes

import application.ports.EventServicePort
import cask.Routes
import domain.commands.{GetAllEventsCommand, GetEventCommand, GetFilteredEventsCommand, UpdateEventPosterCommand}
import infrastructure.converters.EventConversions.*
import infrastructure.dto.Event
import middleware.auth.JwtService
import ujson.Obj
import utils.Utils

class EventQueryRoutes(eventService: EventServicePort) extends Routes:

  private val mediaServiceUrl = "http://media:9020"
  private val host            = sys.env.getOrElse("HOST", "localhost")

  @cask.get("/:eventId")
  def getEvent(eventId: String): cask.Response[ujson.Value] =
    val command = GetEventCommand(eventId)
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
            val eventList = events.collect { case e: Event => e }
            val response = Utils.createPaginatedResponse(
              eventList,
              None,
              None,
              hasMore = false
            )
            cask.Response(response, statusCode = 200)
          case _ => cask.Response(ujson.Arr(), statusCode = 200)
      case Left(errors) =>
        cask.Response(
          ujson.Obj("error" -> s"Could not retrieve events $errors"),
          statusCode = 404
        )

  @cask.get("/search")
  def getEvents(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[Seq[String]] = None,
      title: Option[String] = None,
      tags: Option[Seq[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      organizationId: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None,
      sortBy: Option[String] = None,
      sortOrder: Option[String] = None,
      query: Option[String] = None,
      near: Option[String] = None,
      other: Option[String] = None,
      price: Option[String] = None,
      req: cask.Request
  ): cask.Response[ujson.Value] =
    val authOpt = req.headers.get("authorization").flatMap(_.headOption).flatMap { auth =>
      if auth.startsWith("Bearer ") then Some(auth.drop(7)) else None
    }

    val authenticatedUserId: Option[String] = authOpt.flatMap { token =>
      JwtService.validateToken(token).toOption.map(_.userId)
    }

    val isAuthenticated = organizationId.exists(orgId => authenticatedUserId.contains(orgId))

    val authCheckResponse: Option[cask.Response[ujson.Value]] =
      if status.map(_.map(_.toUpperCase).contains("DRAFT")).getOrElse(false) then
        authenticatedUserId match
          case None =>
            Some(cask.Response(
              Obj("error" -> "Unauthorized", "message" -> "No authorization token provided"),
              statusCode = 401
            ))
          case Some(userId) =>
            if (organizationId.isDefined && organizationId.get != userId) || (organizationId.isEmpty) then
              Some(cask.Response(
                Obj("error" -> "Forbidden", "message" -> "User is not authorized to access draft events"),
                statusCode = 403
              ))
            else
              None
      else
        None

    if authCheckResponse.isDefined then
      authCheckResponse.get
    else
      val tagsList: Option[List[String]]   = tags.map(_.toList)
      val statusList: Option[List[String]] = status.map(_.toList)
      val command: GetFilteredEventsCommand = Utils.parseEventFilters(
        limit,
        offset,
        statusList,
        title,
        tagsList,
        startDate,
        endDate,
        organizationId,
        city,
        location_name,
        sortBy,
        sortOrder,
        query,
        near,
        other,
        price,
        isAuthenticated
      )
      eventService.handleCommand(command) match
        case Right((events: List[?], hasMore: Boolean)) =>
          val eventList = events.collect { case e: Event => e }
          val response = Utils.createPaginatedResponse(
            eventList,
            limit,
            offset,
            hasMore
          )
          cask.Response(response, statusCode = 200)
        case Left(errors) =>
          cask.Response(
            ujson.Obj("error" -> s"Could not retrieve events $errors"),
            statusCode = 400
          )
        case _ =>
          cask.Response(
            ujson.Obj("error" -> "Error"),
            statusCode = 404
          )

  @cask.postForm("/:eventId/poster")
  def updateEventPoster(eventId: String, poster: cask.FormFile, req: cask.Request): cask.Response[ujson.Value] =
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
              Obj("error" -> "Forbidden", "message" -> "User is not authorized to update the poster for this event"),
              statusCode = 403
            )
          case true =>
            eventService.handleCommand(GetEventCommand(eventId)) match
              case Left(value) =>
                cask.Response(
                  Obj("error" -> s"$value"),
                  statusCode = 404
                )
              case _ =>
                val posterUrl = Utils.uploadPosterToMediaService(eventId, Some(poster), mediaServiceUrl)
                val updateCommand = UpdateEventPosterCommand(
                  eventId = eventId,
                  posterUrl = s"http://media.$host/$posterUrl"
                )
                eventService.handleCommand(updateCommand) match
                  case Right(_) =>
                    cask.Response(
                      Obj("message" -> "Poster updated successfully"),
                      statusCode = 200
                    )
                  case Left(value) =>
                    cask.Response(
                      Obj("error" -> value),
                      statusCode = 400
                    )

  @cask.delete("/:eventId/poster")
  def deleteEventPoster(eventId: String, req: cask.Request): cask.Response[ujson.Value] =
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
              Obj("error" -> "Forbidden", "message" -> "User is not authorized to delete the poster for this event"),
              statusCode = 403
            )
          case true =>
            val defaultUrl = "events/default.jpg"

            val updateCommand = UpdateEventPosterCommand(
              eventId = eventId,
              posterUrl = s"http://media.$host/$defaultUrl"
            )
            eventService.handleCommand(updateCommand) match
              case Right(_) =>
                cask.Response(
                  Obj("message" -> "Poster deleted successfully"),
                  statusCode = 200
                )
              case Left(value) =>
                cask.Response(
                  Obj("error" -> value),
                  statusCode = 400
                )

  initialize()
