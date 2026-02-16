package infrastructure.adapters

import application.EventApplicationService
import application.dto.EventConverter
import application.ports.EventServicePort
import domain.commands.*
import domain.models.Event
import domain.valueobjects.EventId

class LegacyEventServiceAdapter(
    private val applicationService: EventApplicationService
) extends EventServicePort:

  override def handleCommand(cmd: Commands): Either[String, Any] =
    applicationService.handleCommand(cmd)

  override def getEventInfo(eventId: String): Either[String, Event] =
    EventId(eventId) match
      case Left(error) => Left(error)
      case Right(_) =>
        applicationService.handleCommand(GetEventCommand(eventId)) match
          case Left(error) => Left(error)
          case Right(aggregate: domain.aggregates.Event) =>
            Right(EventConverter.toDTO(aggregate))
          case Right(other) =>
            Left(s"Unexpected result type from GetEventCommand: ${other.getClass.getSimpleName}")
