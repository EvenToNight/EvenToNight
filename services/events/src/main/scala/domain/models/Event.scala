package domain.models

import java.time.LocalDateTime
import java.util.UUID

case class Event(
    _id: String,
    title: String,
    description: String,
    poster: String,
    tags: List[EventTag],
    location: Location,
    date: LocalDateTime,
    price: Double,
    status: EventStatus,
    instant: java.time.Instant,
    id_creator: String,
    id_collaborators: Option[List[String]]
)

object Event:

  def nil(): Event =
    Event(
      _id = "",
      title = "",
      description = "",
      poster = "",
      tags = List(),
      location = Location.Nil(),
      date = LocalDateTime.MAX,
      price = 0.0,
      status = EventStatus.DRAFT,
      instant = java.time.Instant.MAX,
      id_creator = "",
      id_collaborators = None
    )

  def create(
      title: String,
      description: String,
      poster: String,
      tags: List[EventTag],
      location: Location,
      date: LocalDateTime,
      price: Double,
      status: EventStatus,
      id_creator: String,
      id_collaborators: Option[List[String]]
  ): Event =
    Event(
      _id = UUID.randomUUID().toString,
      title = title,
      description = description,
      poster = poster,
      tags = tags,
      location = location,
      date = date,
      price = price,
      status = status,
      instant = java.time.Instant.now(),
      id_creator = id_creator,
      id_collaborators = id_collaborators
    )
