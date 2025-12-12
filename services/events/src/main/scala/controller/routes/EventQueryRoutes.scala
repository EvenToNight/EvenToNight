package controller.routes

import cask.Routes
import domain.commands.{GetAllEventsCommand, GetEventCommand, GetFilteredEventsCommand, UpdateEventPosterCommand}
import domain.models.Event
import domain.models.EventConversions.*
import service.EventService
import ujson.Obj
import utils.Utils

class EventQueryRoutes(eventService: EventService) extends Routes:

  private val mediaServiceUrl = "http://media:9020"

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
            val eventList = events.collect { case e: Event => e }
            val response = Utils.createPaginatedResponse(
              eventList,
              None,
              None,
              hasMore = false
            )
            cask.Response(ujson.Arr(events.collect { case e: Event => e.toJson }), statusCode = 200)
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
      status: Option[String] = None,
      title: Option[String] = None,
      tags: Option[Seq[String]] = None,
      startDate: Option[String] = None,
      endDate: Option[String] = None,
      id_organization: Option[String] = None,
      city: Option[String] = None,
      location_name: Option[String] = None
  ): cask.Response[ujson.Value] =
    println("EventQueryRoutes tags param: " + tags)
    val tagsList: Option[List[String]] = tags.map(_.toList)
    val command: GetFilteredEventsCommand = Utils.parseEventFilters(
      limit,
      offset,
      status,
      title,
      tagsList,
      startDate,
      endDate,
      id_organization,
      city,
      location_name
    )
    println("EventQueryRoutes" + command.tags.getOrElse(List()))
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

  @cask.postForm("/:id_event/poster")
  def updateEventPoster(id_event: String, poster: cask.FormFile): cask.Response[ujson.Value] =
    eventService.handleCommand(GetEventCommand(id_event)) match
      case Left(value) =>
        cask.Response(
          Obj("error" -> s"$value"),
          statusCode = 404
        )
      case _ =>
        val posterUrl = Utils.uploadPosterToMediaService(id_event, poster, mediaServiceUrl)
        val updateCommand = UpdateEventPosterCommand(
          id_event = id_event,
          posterUrl = posterUrl
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

  initialize()
