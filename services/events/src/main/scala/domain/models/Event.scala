package domain.models

import java.time.LocalDateTime
import java.util.UUID

case class Event(
    _id: String,
    title: Option[String] = None,
    description: Option[String] = None,
    poster: Option[String] = None,
    tags: Option[List[EventTag]] = None,
    location: Option[Location] = None,
    date: Option[LocalDateTime] = None,
    price: Option[Double] = None,
    status: EventStatus,
    instant: java.time.Instant,
    id_creator: String,
    id_collaborators: Option[List[String]]
)

object Event:

  def nil(): Event =
    Event(
      _id = "",
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      price = None,
      status = EventStatus.DRAFT,
      instant = java.time.Instant.MAX,
      id_creator = "",
      id_collaborators = None
    )

  def create(
      title: Option[String] = None,
      description: Option[String] = None,
      poster: Option[String] = None,
      tags: Option[List[EventTag]] = None,
      location: Option[Location] = None,
      date: Option[LocalDateTime] = None,
      price: Option[Double] = None,
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
