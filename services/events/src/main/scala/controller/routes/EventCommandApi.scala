package controller.routes

import domain.commands.CreateEventDraftCommand
import domain.models.EventTag
import service.EventService

import java.time.LocalDateTime

class EventCommandApi(eventService: EventService) extends BaseRoutes:

  @cask.get("/events/draft")
  def createDraft(): String =
    val command = CreateEventDraftCommand(
      title = "title",
      description = "description",
      poster = "poster",
      tag = List(EventTag.TypeOfEvent.Concert),
      location = "location",
      date = LocalDateTime.parse("2028-12-31T20:00:00"),
      id_creator = "id_creator",
      id_collaborator = None
    )
    val eventId = eventService.handleCreateDraft(command)
    "Event Created " + eventId

  initialize()
