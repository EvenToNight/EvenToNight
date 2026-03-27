package domain.events

import io.circe.syntax.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{Instant, LocalDateTime}

class DomainEventsSpec extends AnyFlatSpec with Matchers:

  "DomainEvent encoder" should "encode EventCreated payload" in {
    val event: DomainEvent = EventCreated(
      eventId = "event-1",
      creatorId = "creator-1",
      collaboratorIds = Some(List("collab-1")),
      name = Some("Scala Meetup"),
      date = Some(LocalDateTime.parse("2030-01-01T10:00:00")),
      status = "DRAFT",
      tags = Some(List("tech")),
      instant = Some(123L),
      locationName = Some("Milan")
    )

    val json = event.asJson(using DomainEvent.encoder)
    json.hcursor.get[String]("eventId") shouldBe Right("event-1")
    json.hcursor.get[String]("creatorId") shouldBe Right("creator-1")
    json.hcursor.get[String]("status") shouldBe Right("DRAFT")
  }

  it should "encode EventUpdated payload" in {
    val event: DomainEvent = EventUpdated(
      eventId = "event-2",
      collaboratorIds = Some(List("collab-1", "collab-2")),
      name = Some("Updated title"),
      date = Some(LocalDateTime.parse("2030-01-02T10:00:00")),
      status = "PUBLISHED",
      tags = Some(List("music")),
      instant = Some(456L),
      locationName = Some("Rome")
    )

    val json = event.asJson(using DomainEvent.encoder)
    json.hcursor.get[String]("eventId") shouldBe Right("event-2")
    json.hcursor.get[String]("status") shouldBe Right("PUBLISHED")
    json.hcursor.get[String]("locationName") shouldBe Right("Rome")
  }

  it should "encode all the other event variants" in {
    val published: DomainEvent = EventPublished("event-3", "Conference", "creator-2", "Tommi")
    val deleted: DomainEvent   = EventDeleted("event-4")
    val completed: DomainEvent = EventCompleted("event-5")
    val cancelled: DomainEvent = EventCancelled("event-6")

    published.asJson(using DomainEvent.encoder).hcursor.get[String]("creatorName") shouldBe Right("Tommi")
    deleted.asJson(using DomainEvent.encoder).hcursor.get[String]("eventId") shouldBe Right("event-4")
    completed.asJson(using DomainEvent.encoder).hcursor.get[String]("eventId") shouldBe Right("event-5")
    cancelled.asJson(using DomainEvent.encoder).hcursor.get[String]("eventId") shouldBe Right("event-6")
  }

  "EventEnvelope" should "carry metadata and payload" in {
    val occurredAt = Instant.parse("2030-01-01T10:00:00Z")
    val payload    = EventDeleted("event-7")
    val envelope   = EventEnvelope("EventDeleted", occurredAt, payload)

    envelope.eventType shouldBe "EventDeleted"
    envelope.occurredAt shouldBe occurredAt
    envelope.payload shouldBe payload
  }

  it should "support copy and structural equality" in {
    val original = EventEnvelope(
      eventType = "EventCancelled",
      occurredAt = Instant.parse("2030-01-01T11:00:00Z"),
      payload = EventCancelled("event-8")
    )
    val copied = original.copy(eventType = "EventCancelledUpdated")

    copied.eventType shouldBe "EventCancelledUpdated"
    copied.payload shouldBe original.payload
    copied should not be original
  }

  "Event case classes" should "support copy, extractors and defaults" in {
    val date = LocalDateTime.parse("2030-06-10T18:30:00")

    val createdBase = EventCreated(
      eventId = "event-10",
      creatorId = "creator-10",
      collaboratorIds = Some(List("org-1")),
      name = Some("Original"),
      date = Some(date),
      status = "DRAFT"
    )
    createdBase.tags shouldBe None
    createdBase.instant shouldBe None
    createdBase.locationName shouldBe None

    val createdCopy = createdBase.copy(status = "PUBLISHED", tags = Some(List("tag-1")))
    createdCopy.productArity shouldBe 9
    val EventCreated(createdId, createdCreator, _, createdName, createdDate, createdStatus, createdTags, _, _) =
      createdCopy
    createdId shouldBe "event-10"
    createdCreator shouldBe "creator-10"
    createdName shouldBe Some("Original")
    createdDate shouldBe Some(date)
    createdStatus shouldBe "PUBLISHED"
    createdTags shouldBe Some(List("tag-1"))

    val updated = EventUpdated(
      eventId = "event-11",
      collaboratorIds = Some(List("org-2")),
      name = Some("Update"),
      date = Some(date.plusDays(1)),
      status = "PUBLISHED"
    )
    val updatedCopy = updated.copy(locationName = Some("Turin"), instant = Some(999L))
    val EventUpdated(updatedId, _, _, _, updatedStatus, _, updatedInstant, updatedLocationName) = updatedCopy
    updatedId shouldBe "event-11"
    updatedStatus shouldBe "PUBLISHED"
    updatedInstant shouldBe Some(999L)
    updatedLocationName shouldBe Some("Turin")
  }

  it should "support extractor behavior for one-field events" in {
    val deleted   = EventDeleted("event-20")
    val completed = EventCompleted("event-21")
    val cancelled = EventCancelled("event-22")

    val EventDeleted(deletedId)     = deleted
    val EventCompleted(completedId) = completed
    val EventCancelled(cancelledId) = cancelled

    deletedId shouldBe "event-20"
    completedId shouldBe "event-21"
    cancelledId shouldBe "event-22"
    deleted.productArity shouldBe 1
    completed.productPrefix shouldBe "EventCompleted"
    cancelled shouldBe EventCancelled("event-22")
  }

  it should "cover equals/hashCode branches for event case classes" in {
    val date = LocalDateTime.parse("2030-07-01T12:00:00")

    val created = EventCreated("e1", "c1", None, Some("n"), Some(date), "DRAFT")
    created.equals(null) shouldBe false
    created.equals("other") shouldBe false
    created.hashCode shouldBe created.copy().hashCode

    val published = EventPublished("e2", "name", "c2", "creator")
    published.equals(null) shouldBe false
    published.equals(created) shouldBe false

    val updated = EventUpdated("e3", None, Some("up"), Some(date), "PUBLISHED")
    updated.equals(null) shouldBe false
    updated.equals(published) shouldBe false

    val deleted = EventDeleted("e4")
    deleted.equals(null) shouldBe false
    deleted.equals(updated) shouldBe false

    val completed = EventCompleted("e5")
    completed.equals(null) shouldBe false
    completed.equals(deleted) shouldBe false

    val cancelled = EventCancelled("e6")
    cancelled.equals(null) shouldBe false
    cancelled.equals(completed) shouldBe false
  }
