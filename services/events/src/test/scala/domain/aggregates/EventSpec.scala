package domain.aggregates

import domain.enums.EventStatus
import domain.valueobjects.{EventId, EventTitle, OrganizationId}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{Instant, LocalDateTime}

class EventSpec extends AnyFlatSpec with Matchers:

  "Event.create" should "create a new Event in DRAFT status" in {
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
  }

  "Event.publish" should "transition from DRAFT to PUBLISHED when event has required fields" in {
    val event  = createPublishableEvent()
    val result = event.publish("John Doe")

    result.isRight.shouldBe(true)
    result.map(_.status).shouldBe(Right(EventStatus.PUBLISHED))
  }

  it should "fail if event cannot be published" in {
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
    val event  = createPublishableEvent().publish("John Doe").getOrElse(fail("Failed to publish"))
    val result = event.publish("John Doe")

    result.isLeft.shouldBe(true)
  }

  "Event.cancel" should "transition from PUBLISHED to CANCELLED" in {
    val event  = createPublishableEvent().publish("John Doe").getOrElse(fail("Failed to publish"))
    val result = event.cancel()

    result.isRight.shouldBe(true)
    result.map(_.status).shouldBe(Right(EventStatus.CANCELLED))
  }

  it should "fail if event is not PUBLISHED" in {
    val event = Event.create(
      title = Some(EventTitle.unsafe("Event")),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-123"),
      collaboratorIds = None
    )
    val result = event.cancel()

    result.isLeft.shouldBe(true)
  }

  "Event.complete" should "transition from PUBLISHED to COMPLETED" in {
    val event  = createPublishableEvent().publish("John Doe").getOrElse(fail("Failed to publish"))
    val result = event.complete()

    result.isRight.shouldBe(true)
    result.map(_.status).shouldBe(Right(EventStatus.COMPLETED))
  }

  it should "fail if event is not PUBLISHED" in {
    val event = Event.create(
      title = Some(EventTitle.unsafe("Event")),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-123"),
      collaboratorIds = None
    )
    val result = event.complete()

    result.isLeft.shouldBe(true)
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

  "Event.reconstitute" should "recreate an Event from persisted data" in {
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
