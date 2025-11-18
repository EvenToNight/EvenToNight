package domain.models

import java.time.LocalDateTime
import java.util.UUID

case class Event(
    _id: String,
    title: String,
    description: String,
    poster: String,
    tag: List[EventTag],
    location: String,
    date: LocalDateTime,
    status: EventStatus,
    instant: java.time.Instant,
    id_creator: String,
    id_collaborator: Option[String]
)

object Event:

  def createDraft(
      title: String,
      description: String,
      poster: String,
      tag: List[EventTag],
      location: String,
      date: LocalDateTime,
      id_creator: String,
      id_collaborator: Option[String]
  ): Event =
    Event(
      _id = UUID.randomUUID().toString,
      title = title,
      description = description,
      poster = poster,
      tag = tag,
      location = location,
      date = date,
      status = EventStatus.DRAFT,
      instant = java.time.Instant.now(),
      id_creator = id_creator,
      id_collaborator = id_collaborator
    )
