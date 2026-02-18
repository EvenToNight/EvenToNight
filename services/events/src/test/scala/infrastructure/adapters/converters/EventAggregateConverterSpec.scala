package infrastructure.adapters.converters

import domain.aggregates.Event as EventAggregate
import domain.enums.{EventStatus, EventTag}
import domain.valueobjects.{EventDescription, EventId, EventTitle, Location, OrganizationId}
import infrastructure.dto.{Event as EventDTO, Location as LocationDTO}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{Instant, LocalDateTime}

class EventAggregateConverterSpec extends AnyFlatSpec with Matchers:

  "EventAggregateConverter.toModel" should "convert Event aggregate to DTO" in {
    val aggregate = createTestAggregate()
    val dto       = EventAggregateConverter.toModel(aggregate)

    dto._id.shouldBe(aggregate.id.value)
    dto.title.shouldBe(aggregate.title.map(_.value))
    dto.description.shouldBe(aggregate.description.map(_.value))
    dto.status.shouldBe(aggregate.status)
    dto.creatorId.shouldBe(aggregate.creatorId.value)
    dto.isFree.shouldBe(aggregate.isFree)
  }

  it should "convert Location value object to LocationDTO" in {
    val location = Location.unsafe(
      name = Some("Teatro"),
      country = Some("Italy"),
      countryCode = Some("IT"),
      state = None,
      province = None,
      city = Some("Milano"),
      road = Some("Via Roma"),
      postcode = Some("20100"),
      houseNumber = Some("10"),
      lat = Some(45.4642),
      lon = Some(9.1900),
      link = None
    )

    val aggregate = EventAggregate.create(
      title = Some(EventTitle.unsafe("Test")),
      description = None,
      poster = None,
      tags = None,
      location = Some(location),
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-123"),
      collaboratorIds = None
    )

    val dto = EventAggregateConverter.toModel(aggregate)

    dto.location.isDefined.shouldBe(true)
    dto.location.get.name.shouldBe(Some("Teatro"))
    dto.location.get.city.shouldBe(Some("Milano"))
    dto.location.get.country_code.shouldBe(Some("IT"))
    dto.location.get.lat.shouldBe(Some(45.4642))
    dto.location.get.lon.shouldBe(Some(9.1900))
  }

  it should "handle events without optional fields" in {
    val aggregate = EventAggregate.create(
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

    val dto = EventAggregateConverter.toModel(aggregate)

    dto.title.shouldBe(None)
    dto.description.shouldBe(None)
    dto.location.shouldBe(None)
    dto.poster.shouldBe(None)
  }

  "EventAggregateConverter.fromModel" should "convert DTO to Event aggregate" in {
    val dto       = createTestDTO()
    val aggregate = EventAggregateConverter.fromModel(dto)

    aggregate.id.value.shouldBe(dto._id)
    aggregate.title.map(_.value).shouldBe(dto.title)
    aggregate.description.map(_.value).shouldBe(dto.description)
    aggregate.status.shouldBe(dto.status)
    aggregate.creatorId.value.shouldBe(dto.creatorId)
    aggregate.isFree.shouldBe(dto.isFree)
  }

  it should "convert LocationDTO to Location value object" in {
    val locationDTO = LocationDTO(
      name = Some("Arena"),
      country = Some("Italy"),
      country_code = Some("IT"),
      state = None,
      province = None,
      city = Some("Roma"),
      road = None,
      postcode = None,
      house_number = None,
      lat = Some(41.9028),
      lon = Some(12.4964),
      link = None
    )

    val dto       = createTestDTO().copy(location = Some(locationDTO))
    val aggregate = EventAggregateConverter.fromModel(dto)

    aggregate.location.isDefined.shouldBe(true)
    aggregate.location.get.name.shouldBe(Some("Arena"))
    aggregate.location.get.city.shouldBe(Some("Roma"))
    aggregate.location.get.hasCoordinates.shouldBe(true)
  }

  it should "handle collaboratorIds correctly" in {
    val dto = createTestDTO().copy(
      collaboratorIds = Some(List("collab-1", "collab-2", "collab-3"))
    )
    val aggregate = EventAggregateConverter.fromModel(dto)

    aggregate.collaboratorIds.length.shouldBe(3)
    aggregate.collaboratorIds.map(_.value) should contain allOf ("collab-1", "collab-2", "collab-3")
  }

  "EventAggregateConverter round-trip" should "preserve data integrity" in {
    val originalAggregate      = createTestAggregate()
    val dto                    = EventAggregateConverter.toModel(originalAggregate)
    val reconstructedAggregate = EventAggregateConverter.fromModel(dto)

    reconstructedAggregate.id.shouldBe(originalAggregate.id)
    reconstructedAggregate.title.shouldBe(originalAggregate.title)
    reconstructedAggregate.description.shouldBe(originalAggregate.description)
    reconstructedAggregate.status.shouldBe(originalAggregate.status)
    reconstructedAggregate.creatorId.shouldBe(originalAggregate.creatorId)
    reconstructedAggregate.isFree.shouldBe(originalAggregate.isFree)
  }

  // Helper methods
  private def createTestAggregate(): EventAggregate =
    EventAggregate.create(
      title = Some(EventTitle.unsafe("Test Event")),
      description = Some(EventDescription.unsafe("Test description")),
      poster = Some("https://example.com/poster.jpg"),
      tags = Some(List(EventTag.EventType.Concert, EventTag.Venue.Outdoor)),
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-123"),
      collaboratorIds = None
    )

  private def createTestDTO(): EventDTO =
    EventDTO(
      _id = "event-dto-123",
      title = Some("DTO Test Event"),
      description = Some("DTO description"),
      poster = Some("https://example.com/poster.jpg"),
      tags = Some(List(EventTag.EventType.Concert)),
      location = None,
      date = Some(LocalDateTime.of(2024, 6, 15, 20, 0)),
      status = EventStatus.DRAFT,
      instant = Instant.now(),
      creatorId = "org-dto-123",
      collaboratorIds = Some(List.empty),
      isFree = true
    )
