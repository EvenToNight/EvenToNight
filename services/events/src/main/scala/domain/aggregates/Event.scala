package domain.aggregates

import domain.enums.{EventStatus, EventStatusTransitions, EventTag}
import domain.events.*
import domain.valueobjects.{EventDescription, EventId, EventTitle, Location, OrganizationId}

import java.time.{Instant, LocalDateTime}

case class Event private (
    id: EventId,
    title: Option[EventTitle],
    description: Option[EventDescription],
    poster: Option[String],
    tags: Option[List[EventTag]],
    location: Option[Location],
    date: Option[LocalDateTime],
    status: EventStatus,
    createdAt: Instant,
    creatorId: OrganizationId,
    collaboratorIds: List[OrganizationId],
    isFree: Boolean,
    pendingEvents: List[DomainEvent]
):

  def domainEvents: List[DomainEvent] = pendingEvents

  def clearDomainEvents(): Event = this.copy(pendingEvents = List.empty)

  def publish(creatorName: String): Either[String, Event] =
    if status != EventStatus.DRAFT then
      Left(EventStatusTransitions.getTransitionErrorMessage(status, EventStatus.PUBLISHED))
    else if !canBePublished then
      Left("Event cannot be published without title, location and date")
    else
      val updatedEvent = this.copy(
        status = EventStatus.PUBLISHED,
        pendingEvents = pendingEvents :+ EventPublished(
          eventId = id.value,
          name = title.map(_.value).getOrElse(""),
          creatorId = creatorId.value,
          creatorName = creatorName
        )
      )
      Right(updatedEvent)

  def cancel(): Either[String, Event] =
    if status != EventStatus.PUBLISHED then
      Left(EventStatusTransitions.getTransitionErrorMessage(status, EventStatus.CANCELLED))
    else
      val updatedEvent = this.copy(
        status = EventStatus.CANCELLED,
        pendingEvents = pendingEvents :+ EventCancelled(id.value)
      )
      Right(updatedEvent)

  def complete(): Either[String, Event] =
    if status != EventStatus.PUBLISHED then
      Left(EventStatusTransitions.getTransitionErrorMessage(status, EventStatus.COMPLETED))
    else
      val updatedEvent = this.copy(
        status = EventStatus.COMPLETED,
        pendingEvents = pendingEvents :+ EventCompleted(id.value)
      )
      Right(updatedEvent)

  def update(
      newTitle: Option[EventTitle],
      newDescription: Option[EventDescription],
      newTags: Option[List[EventTag]],
      newLocation: Option[Location],
      newDate: Option[LocalDateTime],
      newStatus: EventStatus,
      newCollaboratorIds: Option[List[OrganizationId]],
      creatorName: String
  ): Either[String, Event] =

    if status == EventStatus.COMPLETED then
      Left("Cannot update a completed event")
    else if !EventStatusTransitions.isValidTransition(status, newStatus) then
      Left(EventStatusTransitions.getTransitionErrorMessage(status, newStatus))
    else
      val wasPublished = status == EventStatus.PUBLISHED
      val nowPublished = newStatus == EventStatus.PUBLISHED
      val wasCancelled = status == EventStatus.CANCELLED
      val nowCancelled = newStatus == EventStatus.CANCELLED

      var events: List[DomainEvent] = List(EventUpdated(
        eventId = id.value,
        collaboratorIds = newCollaboratorIds.map(_.map(_.value)),
        name = newTitle.map(_.value),
        date = newDate,
        status = newStatus.asString,
        tags = newTags.map(_.map(_.displayName)),
        instant = Some(createdAt.toEpochMilli),
        locationName = newLocation.map(_.displayName)
      ))

      if !wasPublished && nowPublished then
        events = events :+ EventPublished(
          eventId = id.value,
          name = newTitle.map(_.value).getOrElse(""),
          creatorId = creatorId.value,
          creatorName = creatorName
        )

      if !wasCancelled && nowCancelled then
        events = events :+ EventCancelled(id.value)

      val updatedEvent = this.copy(
        title = newTitle,
        description = newDescription,
        tags = newTags,
        location = newLocation,
        date = newDate,
        status = newStatus,
        collaboratorIds = newCollaboratorIds.getOrElse(collaboratorIds),
        pendingEvents = pendingEvents ++ events
      )
      Right(updatedEvent)

  def addCollaborator(collaboratorId: OrganizationId): Either[String, Event] =
    if status == EventStatus.COMPLETED then
      Left("Cannot add collaborators to a completed event")
    else if collaboratorIds.contains(collaboratorId) then
      Left(s"Collaborator ${collaboratorId.value} is already part of this event")
    else
      Right(this.copy(collaboratorIds = collaboratorIds :+ collaboratorId))

  def removeCollaborator(collaboratorId: OrganizationId): Either[String, Event] =
    if status == EventStatus.COMPLETED then
      Left("Cannot remove collaborators from a completed event")
    else if collaboratorId == creatorId then
      Left("Cannot remove the event creator")
    else if !collaboratorIds.contains(collaboratorId) then
      Left(s"Collaborator ${collaboratorId.value} is not part of this event")
    else
      Right(this.copy(collaboratorIds = collaboratorIds.filterNot(_ == collaboratorId)))

  def updatePoster(posterUrl: String): Either[String, Event] =
    if status == EventStatus.COMPLETED then
      Left("Cannot update poster of a completed event")
    else if posterUrl.trim.isEmpty then
      Left("Poster URL cannot be empty")
    else
      Right(this.copy(poster = Some(posterUrl.trim)))

  def hasPassed: Boolean =
    date.exists(_.isBefore(LocalDateTime.now()))

  private def canBePublished: Boolean =
    title.isDefined && location.isDefined && date.isDefined

  def isOrganizer(organizationId: OrganizationId): Boolean =
    creatorId == organizationId || collaboratorIds.contains(organizationId)

  def canBeHardDeleted: Boolean =
    status != EventStatus.PUBLISHED

  def shouldBeSoftDeleted: Boolean =
    status == EventStatus.PUBLISHED

  def prepareForDeletion(): Either[String, Event] =
    if !canBeHardDeleted then
      Left(s"Cannot hard delete event in ${status.asString} status. Use cancel() instead.")
    else
      val updatedEvent = this.copy(
        pendingEvents = pendingEvents :+ EventDeleted(id.value)
      )
      Right(updatedEvent)

object Event:

  def create(
      title: Option[EventTitle],
      description: Option[EventDescription],
      poster: Option[String],
      tags: Option[List[EventTag]],
      location: Option[Location],
      date: Option[LocalDateTime],
      status: EventStatus,
      creatorId: OrganizationId,
      collaboratorIds: Option[List[OrganizationId]]
  ): Event =

    val eventId = EventId.generate()
    val now     = Instant.now()

    val event = Event(
      id = eventId,
      title = title,
      description = description,
      poster = poster,
      tags = tags,
      location = location,
      date = date,
      status = status,
      createdAt = now,
      creatorId = creatorId,
      collaboratorIds = collaboratorIds.getOrElse(List.empty),
      isFree = true,
      pendingEvents = List(EventCreated(
        eventId = eventId.value,
        creatorId = creatorId.value,
        collaboratorIds = collaboratorIds.map(_.map(_.value)),
        name = title.map(_.value),
        date = date,
        status = status.asString,
        tags = tags.map(_.map(_.displayName)),
        instant = Some(now.toEpochMilli),
        locationName = location.map(_.displayName)
      ))
    )

    event

  /** Reconstructs an Event from persistence (without generating domain events)
    * Use this when loading events from the database
    */
  def reconstitute(
      id: EventId,
      title: Option[EventTitle],
      description: Option[EventDescription],
      poster: Option[String],
      tags: Option[List[EventTag]],
      location: Option[Location],
      date: Option[LocalDateTime],
      status: EventStatus,
      createdAt: Instant,
      creatorId: OrganizationId,
      collaboratorIds: List[OrganizationId],
      isFree: Boolean
  ): Event =
    Event(
      id = id,
      title = title,
      description = description,
      poster = poster,
      tags = tags,
      location = location,
      date = date,
      status = status,
      createdAt = createdAt,
      creatorId = creatorId,
      collaboratorIds = collaboratorIds,
      isFree = isFree,
      pendingEvents = List.empty
    )
