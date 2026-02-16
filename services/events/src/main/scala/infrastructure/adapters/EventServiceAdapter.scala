package infrastructure.adapters

import application.EventApplicationService
import application.dto.EventConverter
import application.ports.EventServicePort
import domain.commands.*
import domain.valueobjects.EventId
import infrastructure.dto.Event

/** Adapter that bridges the Application Service with Controllers
  * Converts domain aggregates to DTOs for presentation layer compatibility
  */
class EventServiceAdapter(
    private val applicationService: EventApplicationService
) extends EventServicePort:

  override def handleCommand(cmd: Commands): Either[String, Any] =
    applicationService.handleCommand(cmd).map { result =>
      result match
        case aggregate: domain.aggregates.Event =>
          EventConverter.toDTO(aggregate)

        case aggregates: List[?] =>
          aggregates.collect { case e: domain.aggregates.Event => EventConverter.toDTO(e) }

        case (aggregates: List[?], hasMore: Boolean) =>
          val dtos = aggregates.collect { case e: domain.aggregates.Event => EventConverter.toDTO(e) }
          (dtos, hasMore)

        case other => other
    }

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
