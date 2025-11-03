package controller

import cask.MainRoutes
import domain.Commands.CreateEventDraftCommand
import domain.EventTag
import domain.EventTag._
import service.EventService
import ujson._

class EventController(eventService: EventService) extends MainRoutes:

  override def port: Int    = 9010
  override def host: String = "0.0.0.0"

  @cask.get("/events/draft")
  def createDraft() = {
    val command = CreateEventDraftCommand(
      title = "Sample Event",
      description = "This is a sample event description.",
      poster = "sample-poster-url",
      tag = List(TypeOfEvent.Concert),
      location = "Sample Location",
      date = java.time.LocalDateTime.now().plusDays(10),
      id_creator = "creator-123",
      id_collaborator = Some("collaborator-456")
    )
    val eventId: String = eventService.handleCreateDraft(command)
    eventId
  }

  @cask.get("/tags")
  def getTags(): ujson.Value =
    val tags = List(
      ("TypeOfEvent", EventTag.TypeOfEvents),
      ("VenueType", EventTag.VenueTypes),
      ("MusicGenre", EventTag.MusicGenres),
      ("Theme", EventTag.Themes),
      ("Target", EventTag.Targets),
      ("Extra", EventTag.Extras)
    )
    val json = tags.map(tag =>
      Obj(
        "category" -> tag._1,
        "tags"     -> ujson.Arr.from(tag._2.map(t => Str(t.toString)))
      )
    )
    json

  initialize()
