package domain.models

import java.time.LocalDateTime
import java.util.UUID

case class Event(
    _id: String,
    title: String,
    description: String,
    poster: String,
    tag: List[EventTag],
    location: Location,
    date: LocalDateTime,
    price: Double,
    status: EventStatus,
    instant: java.time.Instant,
    id_creator: String,
    id_collaborator: Option[String]
)

object Event:

  def nil(): Event =
    Event(
      _id = "",
      title = "",
      description = "",
      poster = "",
      tag = List(),
      location = Location.Nil(),
      date = LocalDateTime.MAX,
      price = 0.0,
      status = EventStatus.DRAFT,
      instant = java.time.Instant.MAX,
      id_creator = "",
      id_collaborator = None
    )

  def create(
      title: String,
      description: String,
      poster: String,
      tag: List[EventTag],
      location: Location,
      date: LocalDateTime,
      price: Double,
      status: EventStatus,
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
      price = price,
      status = status,
      instant = java.time.Instant.now(),
      id_creator = id_creator,
      id_collaborator = id_collaborator
    )
