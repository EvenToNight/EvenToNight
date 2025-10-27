package controller

import cask.MainRoutes
import domain.Commands.CreateEventDraftCommand
import service.EventService

import scala.util.Failure
import scala.util.Success

class EventController(eventService: EventService) extends MainRoutes:

  override def port: Int    = 9010 // events service port
  override def host: String = "0.0.0.0"

  @cask.get("/events/draft")
  def createDraft(request: cask.Request) = {
    eventService.handleCreateDraft(
      CreateEventDraftCommand(
        title = "Sample Event",
        description = "This is a sample event description.",
        poster = "sample_poster.png",
        tag = domain.Tag.Disco,
        location = "Sample Location",
        date = java.time.LocalDateTime.now().plusDays(10),
        id_creator = "creator123",
        id_collaborator = None
      )
    ).onComplete {
      case Success(eventId) =>
        println(s"Event draft created with ID: $eventId")
      case Failure(exception) =>
        println(s"Failed to create event draft: ${exception.getMessage}")
    }
    "Event draft created"
  }

  initialize()
