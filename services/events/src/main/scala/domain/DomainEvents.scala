package domain
import java.time.LocalDateTime

trait DomainEvent {
  val id: String
  val timestamp: java.time.Instant = java.time.Instant.now()
}

case class EventDraftCreated(
    id: String,
    title: String,
    description: String,
    poster: String,
    tag: Tag,
    location: String,
    date: LocalDateTime,
    instant: java.time.Instant,
    id_creator: String,
    id_collaborator: Option[String]
) extends DomainEvent
