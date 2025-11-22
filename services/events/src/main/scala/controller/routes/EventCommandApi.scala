package controller.routes

import domain.commands.CreateEventDraftCommand
import domain.models.EventTag.validateTagList
import service.EventService
import ujson.Obj

import java.time.LocalDateTime

class EventCommandApi(eventService: EventService) extends BaseRoutes:

  @cask.postForm("/event")
  def createDraft(
      title: String,
      description: String,
      poster: cask.FormFile,
      tags: String,
      location: String,
      date: String,
      id_creator: String,
      id_collaborator: Option[String] = None
  ): ujson.Value =
    val posterName = poster.fileName
    println(s"Received tags string: $tags")
    val tagList = validateTagList(tags)

    val command = CreateEventDraftCommand(
      title = title,
      description = description,
      poster = posterName,
      tag = tagList,
      location = location,
      date = LocalDateTime.parse(date),
      id_creator = id_creator,
      id_collaborator = id_collaborator.filter(_.nonEmpty)
    )

    val eventId = eventService.handleCommand(command)
    Obj("id_event" -> eventId)

  initialize()
