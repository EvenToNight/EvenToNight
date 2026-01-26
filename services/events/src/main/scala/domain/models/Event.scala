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
    status: EventStatus,
    instant: java.time.Instant,
    creatorId: String,
    collaboratorIds: Option[List[String]]
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
      status = EventStatus.DRAFT,
      instant = java.time.Instant.MAX,
      creatorId = "",
      collaboratorIds = None
    )

  def create(
      title: Option[String] = None,
      description: Option[String] = None,
      poster: Option[String] = None,
      tags: Option[List[EventTag]] = None,
      location: Option[Location] = None,
      date: Option[LocalDateTime] = None,
      status: EventStatus,
      creatorId: String,
      collaboratorIds: Option[List[String]]
  ): Event =
    Event(
      _id = UUID.randomUUID().toString,
      title = title,
      description = description,
      poster = poster,
      tags = tags,
      location = location,
      date = date,
      status = status,
      instant = java.time.Instant.now(),
      creatorId = creatorId,
      collaboratorIds = collaboratorIds
    )
