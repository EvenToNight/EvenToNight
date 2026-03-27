package application.usecases

import domain.commands.CreateEventCommand
import domain.enums.EventStatus
import domain.events.EventCreated
import infrastructure.fakes.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CreateEventUseCaseSpec extends AnyFlatSpec with Matchers:

  "CreateEventUseCase" should "create an event and publish domain events" in {
    val eventRepo  = new FakeEventRepository()
    val orgRepo    = new FakeOrganizationRepository()
    val publisher  = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()

    val useCase = new CreateEventUseCase(eventRepo, orgRepo, publisher, unitOfWork)

    val command = CreateEventCommand(
      title = Some("Test Title"),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = "org-1",
      collaboratorIds = None
    )

    val result = useCase.execute(command)
    result.isRight shouldBe true

    val eventId    = result.getOrElse(fail("should have succeeded"))
    val savedEvent = eventRepo.events.get(eventId)

    savedEvent.isDefined shouldBe true
    savedEvent.get.title.map(_.value) shouldBe Some("Test Title")
    savedEvent.get.creatorId.value shouldBe "org-1"

    publisher.publishedEvents.exists(_.isInstanceOf[EventCreated]) shouldBe true
  }

  it should "fail if creator is not a valid organization" in {
    val eventRepo  = new FakeEventRepository()
    val orgRepo    = new FakeOrganizationRepository()
    val publisher  = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()

    val useCase = new CreateEventUseCase(eventRepo, orgRepo, publisher, unitOfWork)

    val command = CreateEventCommand(
      title = Some("Test Title"),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = "unknown-org",
      collaboratorIds = None
    )

    val result = useCase.execute(command)
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("Only organizations can create events")
    eventRepo.events.isEmpty shouldBe true
  }

  it should "fail if collaborator is not a valid organization" in {
    val eventRepo  = new FakeEventRepository()
    val orgRepo    = new FakeOrganizationRepository()
    val publisher  = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()

    val useCase = new CreateEventUseCase(eventRepo, orgRepo, publisher, unitOfWork)

    val command = CreateEventCommand(
      title = Some("Test Title"),
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = "org-1",
      collaboratorIds = Some(List("org-2", "unknown"))
    )

    val result = useCase.execute(command)
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("not an organization")
  }

  it should "fail if collaborator list contains invalid organization IDs" in {
    val eventRepo  = new FakeEventRepository()
    val orgRepo    = new FakeOrganizationRepository()
    val publisher  = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()
    val useCase    = new CreateEventUseCase(eventRepo, orgRepo, publisher, unitOfWork)

    val command = CreateEventCommand(
      status = EventStatus.DRAFT,
      creatorId = "org-1",
      collaboratorIds = Some(List(""))
    )
    val result = useCase.execute(command)
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("cannot be null or empty")
  }

  it should "fail if description exceeds max length" in {
    val eventRepo  = new FakeEventRepository()
    val orgRepo    = new FakeOrganizationRepository()
    val publisher  = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()
    val useCase    = new CreateEventUseCase(eventRepo, orgRepo, publisher, unitOfWork)

    val command = CreateEventCommand(
      status = EventStatus.DRAFT,
      creatorId = "org-1",
      description = Some("a" * 5001)
    )
    val result = useCase.execute(command)
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("exceed 5000")
  }

  it should "create an event with all fields provided" in {
    val eventRepo  = new FakeEventRepository()
    val orgRepo    = new FakeOrganizationRepository()
    val publisher  = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()
    val useCase    = new CreateEventUseCase(eventRepo, orgRepo, publisher, unitOfWork)

    import infrastructure.dto.Location
    import java.time.LocalDateTime
    import domain.enums.EventTag

    val command = CreateEventCommand(
      title = Some("Valid"),
      description = Some("Valid desc"),
      poster = Some("url"),
      tags = Some(List(EventTag.fromString("CONCERT"))),
      location = Some(Location(Some("Rome"), None, None, None, None, None, None, None, None, None, None, None)),
      date = Some(LocalDateTime.now()),
      status = EventStatus.DRAFT,
      creatorId = "org-1",
      collaboratorIds = Some(List("org-1"))
    )
    val result = useCase.execute(command)
    result.isRight shouldBe true
  }

  it should "create a PUBLISHED event but not publish domain event if fields are missing" in {
    val eventRepo  = new FakeEventRepository()
    val orgRepo    = new FakeOrganizationRepository()
    val publisher  = new FakeDomainEventPublisher()
    val unitOfWork = new FakeUnitOfWork()
    val useCase    = new CreateEventUseCase(eventRepo, orgRepo, publisher, unitOfWork)

    val command = CreateEventCommand(
      status = EventStatus.PUBLISHED,
      creatorId = "org-1"
    )
    val result = useCase.execute(command)
    result.isRight shouldBe true
    import domain.events.EventPublished
    publisher.publishedEvents.exists(_.isInstanceOf[EventPublished]) shouldBe false
  }
