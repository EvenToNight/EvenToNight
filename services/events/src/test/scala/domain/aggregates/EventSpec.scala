package domain.aggregates

import domain.enums.EventStatus
import domain.events.{EventCancelled, EventCompleted, EventCreated, EventDeleted, EventPublished, EventUpdated}
import domain.valueobjects.{EventId, EventTitle, OrganizationId}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{Instant, LocalDateTime}

class EventSpec extends AnyFlatSpec with Matchers:

  "Event.create" should "create a new Event in DRAFT status and generate EventCreated domain event" in {
    val creatorId = OrganizationId.unsafe("org-123")
    val title     = EventTitle.unsafe("Test Event")

    val event = Event.create(
      title = Some(title),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = creatorId,
      collaboratorIds = None
    )

    event.status.shouldBe(EventStatus.DRAFT)
    event.creatorId.shouldBe(creatorId)
    event.title.shouldBe(Some(title))

    val createdEvents = event.domainEvents
    createdEvents.length shouldBe 1
    createdEvents.head.isInstanceOf[EventCreated] shouldBe true
  }

  "Event.clearDomainEvents" should "remove all pending events from the aggregate" in {
    val event = createDraftEvent()
    event.domainEvents.nonEmpty shouldBe true

    val cleared = event.clearDomainEvents()
    cleared.domainEvents.isEmpty shouldBe true
  }

  "Event.publish" should "transition from DRAFT to PUBLISHED and generate EventPublished when event has required fields" in {
    val event  = createPublishableEvent().clearDomainEvents()
    val result = event.publish("John Doe")

    result.isRight.shouldBe(true)
    val publishedEvent = result.getOrElse(fail("Failed to publish"))
    publishedEvent.status.shouldBe(EventStatus.PUBLISHED)
    publishedEvent.domainEvents.head.isInstanceOf[EventPublished] shouldBe true
  }

  it should "fail if event cannot be published because missing fields" in {
    val event = Event.create(
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-123"),
      collaboratorIds = None
    )
    val result = event.publish("John Doe")

    result.isLeft.shouldBe(true)
  }

  it should "fail if event is not in DRAFT status" in {
    val event  = createPublishableEvent().clearDomainEvents().publish("John Doe").getOrElse(fail("failed"))
    val result = event.publish("John Doe")

    result.isLeft.shouldBe(true)
  }

  "Event.cancel" should "transition from PUBLISHED to CANCELLED and generate EventCancelled" in {
    val event  = createPublishableEvent().clearDomainEvents().publish("John Doe").getOrElse(fail("failed"))
    val result = event.cancel()

    result.isRight.shouldBe(true)
    val cancelledEvent = result.getOrElse(fail("Failed to cancel"))
    cancelledEvent.status.shouldBe(EventStatus.CANCELLED)

    val cancelledEvents = cancelledEvent.domainEvents.filter(_.isInstanceOf[EventCancelled])
    cancelledEvents.length shouldBe 1
  }

  it should "fail if event is not PUBLISHED" in {
    val event  = createDraftEvent()
    val result = event.cancel()

    result.isLeft.shouldBe(true)
  }

  "Event.complete" should "transition from PUBLISHED to COMPLETED and generate EventCompleted" in {
    val event  = createPublishableEvent().clearDomainEvents().publish("John Doe").getOrElse(fail("failed"))
    val result = event.complete()

    result.isRight.shouldBe(true)
    val completedEvent = result.getOrElse(fail("Failed to complete"))
    completedEvent.status.shouldBe(EventStatus.COMPLETED)

    val completedEvents = completedEvent.domainEvents.filter(_.isInstanceOf[EventCompleted])
    completedEvents.length shouldBe 1
  }

  it should "fail if event is not PUBLISHED" in {
    val event  = createDraftEvent()
    val result = event.complete()

    result.isLeft.shouldBe(true)
  }

  "Event.update" should "update fields and generate EventUpdated domain event" in {
    val event    = createDraftEvent().clearDomainEvents()
    val newTitle = EventTitle.unsafe("New Title")
    val result = event.update(
      newTitle = Some(newTitle),
      newDescription = None,
      newTags = None,
      newLocation = None,
      newDate = None,
      newStatus = EventStatus.DRAFT,
      newCollaboratorIds = None,
      creatorName = "Org"
    )

    result.isRight.shouldBe(true)
    val updatedEvent = result.getOrElse(fail("Failed to update"))
    updatedEvent.title shouldBe Some(newTitle)
    updatedEvent.domainEvents.count(_.isInstanceOf[EventUpdated]) shouldBe 1
  }

  it should "reject update if event is completed" in {
    val event =
      createPublishableEvent().clearDomainEvents().publish("Org").flatMap(_.complete()).getOrElse(fail("failed"))
    val result = event.update(None, None, None, None, None, EventStatus.COMPLETED, None, "Org")

    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("Cannot update a completed event")
  }

  it should "reject invalid status transitions during update" in {
    val event  = createDraftEvent().clearDomainEvents()
    val result = event.update(None, None, None, None, None, EventStatus.COMPLETED, None, "Org")

    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("Cannot transition")
  }

  it should "generate EventPublished if status transitions to PUBLISHED via update" in {
    val event = createPublishableEvent().clearDomainEvents()
    val result = event.update(
      event.title,
      event.description,
      event.tags,
      event.location,
      event.date,
      EventStatus.PUBLISHED,
      None,
      "Org"
    )

    result.isRight.shouldBe(true)
    result.toOption.get.domainEvents.exists(_.isInstanceOf[EventPublished]) shouldBe true
  }

  it should "generate EventCancelled if status transitions to CANCELLED via update" in {
    val event = createPublishableEvent().clearDomainEvents().publish("Org").getOrElse(fail(
      "published failed"
    )).clearDomainEvents()
    val result = event.update(
      event.title,
      event.description,
      event.tags,
      event.location,
      event.date,
      EventStatus.CANCELLED,
      None,
      "Org"
    )

    result.isRight.shouldBe(true)
    result.toOption.get.domainEvents.exists(_.isInstanceOf[EventCancelled]) shouldBe true
  }

  "Event.addCollaborator" should "add a new collaborator" in {
    val event          = createDraftEvent()
    val collaboratorId = OrganizationId.unsafe("collab-1")

    val result = event.addCollaborator(collaboratorId)

    result.isRight.shouldBe(true)
    result.map(_.collaboratorIds.contains(collaboratorId)).shouldBe(Right(true))
  }

  it should "not add duplicate collaborators" in {
    val event          = createDraftEvent()
    val collaboratorId = OrganizationId.unsafe("collab-1")

    val e1 = event.addCollaborator(collaboratorId)
    e1.isRight.shouldBe(true)

    val e2 = e1.flatMap(_.addCollaborator(collaboratorId))
    e2.isLeft.shouldBe(true)
  }

  it should "fail to add if event is COMPLETED" in {
    val event =
      createPublishableEvent().clearDomainEvents().publish("Org").flatMap(_.complete()).getOrElse(fail("failed"))
    val result = event.addCollaborator(OrganizationId.unsafe("collab-1"))
    result.isLeft.shouldBe(true)
  }

  "Event.removeCollaborator" should "remove an existing collaborator" in {
    val event          = createDraftEvent()
    val collaboratorId = OrganizationId.unsafe("collab-1")

    val result =
      for
        e1 <- event.addCollaborator(collaboratorId)
        e2 <- e1.removeCollaborator(collaboratorId)
      yield e2

    result.isRight.shouldBe(true)
    result.map(_.collaboratorIds.contains(collaboratorId)).shouldBe(Right(false))
  }

  it should "fail to remove the creator from collaborators" in {
    val event  = createDraftEvent()
    val result = event.removeCollaborator(event.creatorId)
    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("Cannot remove the event creator")
  }

  it should "fail to remove a collaborator from a COMPLETED event" in {
    val event =
      createPublishableEvent().clearDomainEvents().publish("Org").flatMap(_.complete()).getOrElse(fail("failed"))
    val result = event.removeCollaborator(OrganizationId.unsafe("collab-1"))
    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("Cannot remove collaborators from a completed event")
  }

  it should "fail to remove a collaborator that is not in the list" in {
    val event  = createDraftEvent()
    val result = event.removeCollaborator(OrganizationId.unsafe("absent-collab"))
    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("is not part of this event")
  }

  "Event.updatePoster" should "update poster URL successfully" in {
    val event  = createDraftEvent()
    val result = event.updatePoster("http://new-poster.jpg")
    result.isRight.shouldBe(true)
    result.toOption.get.poster shouldBe Some("http://new-poster.jpg")
  }

  it should "fail if poster URL is empty" in {
    val event  = createDraftEvent()
    val result = event.updatePoster("   ")
    result.isLeft.shouldBe(true)
  }

  it should "fail if event is COMPLETED" in {
    val event =
      createPublishableEvent().clearDomainEvents().publish("Org").flatMap(_.complete()).getOrElse(fail("failed"))
    val result = event.updatePoster("http://new-poster.jpg")
    result.isLeft.shouldBe(true)
    result.left.getOrElse("") should include("Cannot update poster of a completed event")
  }

  "Event.hasPassed" should "return true if event date is in the past" in {
    val event = Event.create(
      title = Some(EventTitle.unsafe("Test Event")),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = Some(LocalDateTime.now().minusDays(1)),
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-test"),
      collaboratorIds = None
    )
    event.hasPassed shouldBe true
  }

  it should "return false if event date is in the future or not set" in {
    val futureEvent = Event.create(
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = Some(LocalDateTime.now().plusDays(1)),
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-test"),
      collaboratorIds = None
    )
    futureEvent.hasPassed shouldBe false

    val noDateEvent = Event.create(
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-test"),
      collaboratorIds = None
    )
    noDateEvent.hasPassed shouldBe false
  }

  "Event.isOrganizer" should "return true if organization is creator or collaborator" in {
    val creatorId = OrganizationId.unsafe("creator")
    val collabId  = OrganizationId.unsafe("collab")
    val event = Event.create(
      title = Some(EventTitle.unsafe("Test Event")),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = creatorId,
      collaboratorIds = None
    ).addCollaborator(collabId).getOrElse(fail("add failed"))

    event.isOrganizer(creatorId) shouldBe true
    event.isOrganizer(collabId) shouldBe true
    event.isOrganizer(OrganizationId.unsafe("other")) shouldBe false
  }

  "Event.prepareForDeletion" should "generate EventDeleted domain event if event can be hard deleted" in {
    val event = createDraftEvent().clearDomainEvents()
    event.canBeHardDeleted shouldBe true

    val result = event.prepareForDeletion()
    result.isRight.shouldBe(true)
    result.toOption.get.domainEvents.head.isInstanceOf[EventDeleted] shouldBe true
  }

  it should "fail if event is published" in {
    val event = createPublishableEvent().clearDomainEvents().publish("Org").getOrElse(fail("failed"))
    event.canBeHardDeleted shouldBe false

    val result = event.prepareForDeletion()
    result.isLeft.shouldBe(true)
  }

  "Event.shouldBeSoftDeleted" should "return true only when PUBLISHED" in {
    createPublishableEvent().publish("Org").getOrElse(fail("fail")).shouldBeSoftDeleted shouldBe true
    createDraftEvent().shouldBeSoftDeleted shouldBe false
  }

  "Event.reconstitute" should "recreate an Event from persisted data without creating domain events" in {
    val eventId   = EventId.unsafe("event-123")
    val creatorId = OrganizationId.unsafe("org-123")
    val title     = EventTitle.unsafe("Reconstituted Event")

    val event = Event.reconstitute(
      id = eventId,
      title = Some(title),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.PUBLISHED,
      createdAt = Instant.now(),
      creatorId = creatorId,
      collaboratorIds = List.empty,
      isFree = true
    )

    event.id.shouldBe(eventId)
    event.status.shouldBe(EventStatus.PUBLISHED)
    event.title.shouldBe(Some(title))
    event.domainEvents.isEmpty shouldBe true
  }

  // Helper methods
  private def createDraftEvent(): Event =
    Event.create(
      title = Some(EventTitle.unsafe("Test Event")),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-test"),
      collaboratorIds = None
    )

  private def createPublishableEvent(): Event =
    import domain.valueobjects.Location
    Event.create(
      title = Some(EventTitle.unsafe("Publishable Event")),
      description = None,
      poster = None,
      tags = None,
      location = Location(city = Some("Milano")).toOption,
      date = Some(LocalDateTime.now().plusDays(1)),
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-test"),
      collaboratorIds = None
    )
