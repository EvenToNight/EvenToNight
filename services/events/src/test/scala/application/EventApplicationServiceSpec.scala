package application

import domain.aggregates.Event
import domain.commands.*
import domain.enums.EventStatus
import domain.valueobjects.OrganizationId
import infrastructure.fakes.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventApplicationServiceSpec extends AnyFlatSpec with Matchers:

  "EventApplicationService" should "route CreateEventCommand correctly" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()

    val service = new EventApplicationService(eventRepo, orgRepo, publisher, unitOfWork)

    val command = CreateEventCommand(
      title = Some("Routing Test"),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = "org-1",
      collaboratorIds = None
    )

    val result = service.handleCommand(command)
    result.isRight shouldBe true
    
    result.getOrElse(fail()) match
      case eventId: String => eventRepo.events.contains(eventId) shouldBe true
      case _ => fail("Result was not a string")
  }

  it should "route DeleteEventCommand correctly" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()

    val service = new EventApplicationService(eventRepo, orgRepo, publisher, unitOfWork)

    val draft = Event.create(
      title = None, description = None, poster = None, tags = None, location = None, date = None,
      status = EventStatus.DRAFT, creatorId = OrganizationId.unsafe("org-1"), collaboratorIds = None
    )
    eventRepo.save(draft)

    val command = DeleteEventCommand(eventId = draft.id.value)

    val result = service.handleCommand(command)
    result.isRight shouldBe true
    eventRepo.events.contains(draft.id.value) shouldBe false
  }

  it should "route UpdateEventPosterCommand correctly" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()

    val service = new EventApplicationService(eventRepo, orgRepo, publisher, unitOfWork)

    val draft = Event.create(
      title = None, description = None, poster = None, tags = None, location = None, date = None,
      status = EventStatus.DRAFT, creatorId = OrganizationId.unsafe("org-1"), collaboratorIds = None
    )
    eventRepo.save(draft)

    val command = UpdateEventPosterCommand(eventId = draft.id.value, posterUrl = "img.png")

    val result = service.handleCommand(command)
    result.isRight shouldBe true
    eventRepo.events(draft.id.value).poster shouldBe Some("img.png")
  }

  it should "route GetEventCommand correctly to GetEventQuery" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()

    val service = new EventApplicationService(eventRepo, orgRepo, publisher, unitOfWork)

    val command = GetEventCommand(eventId = "missing")
    val result = service.handleCommand(command)
    
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("not found")
  }
