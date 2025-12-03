package controller.routes

import domain.commands.CreateEventDraftCommand
import domain.commands.UpdateEventPosterCommand
import domain.models.EventTag.validateTagList
import service.EventService
import ujson.Obj
import utils.Utils.parseLocationFromJson
import utils.Utils.uploadPosterToMediaService

import java.time.LocalDateTime

class DomainEventRoutes(eventService: EventService) extends BaseRoutes:

  private val mediaServiceUrl = "http://media:9020"

  @cask.postForm("/")
  def createEventDraft(
      title: String,
      description: String,
      poster: cask.FormFile,
      tags: String,
      location: String,
      date: String,
      price: Double,
      id_creator: String,
      id_collaborator: Option[String] = None
  ): cask.Response[ujson.Value] =
    val tagList     = validateTagList(tags)
    val localityObj = parseLocationFromJson(location)

    val command = CreateEventDraftCommand(
      title = title,
      description = description,
      poster = "",
      tag = tagList,
      location = localityObj,
      date = LocalDateTime.parse(date),
      price = price,
      id_creator = id_creator,
      id_collaborator = id_collaborator.filter(_.nonEmpty)
    )

    eventService.handleCommand(command) match
      case Right(eventId: String) =>
        val posterUrl = uploadPosterToMediaService(eventId, poster, mediaServiceUrl)

        val updateCommand = UpdateEventPosterCommand(
          eventId = eventId,
          posterUrl = posterUrl
        )

        eventService.handleCommand(updateCommand)

        cask.Response(
          Obj("id_event" -> eventId),
          statusCode = 200
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

  initialize()
