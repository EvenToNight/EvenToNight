package application.usecases

import domain.commands.CreateEventCommand
import domain.enums.EventStatus
import domain.events.EventCreated
import infrastructure.fakes.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CreateEventUseCaseSpec extends AnyFlatSpec with Matchers:

  "CreateEventUseCase" should "create an event and publish domain events" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
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

    val eventId = result.getOrElse(fail("should have succeeded"))
    val savedEvent = eventRepo.events.get(eventId)
    
    savedEvent.isDefined shouldBe true
    savedEvent.get.title.map(_.value) shouldBe Some("Test Title")
    savedEvent.get.creatorId.value shouldBe "org-1"
    
    publisher.publishedEvents.exists(_.isInstanceOf[EventCreated]) shouldBe true
  }

  it should "fail if creator is not a valid organization" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
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
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
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
