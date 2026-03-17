package application.usecases

import domain.aggregates.Event
import domain.commands.UpdateEventCommand
import domain.enums.EventStatus
import domain.events.EventUpdated
import domain.services.EventDomainService
import domain.valueobjects.OrganizationId
import infrastructure.fakes.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class UpdateEventUseCaseSpec extends AnyFlatSpec with Matchers:

  "UpdateEventUseCase" should "successfully update an existing event" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
    val domainService = new EventDomainService(orgRepo)
    val useCase = new UpdateEventUseCase(eventRepo, publisher, domainService)

    val draft = Event.create(
      title = None, description = None, poster = None, tags = None, location = None, date = None,
      status = EventStatus.DRAFT, creatorId = OrganizationId.unsafe("org-1"), collaboratorIds = None
    )
    eventRepo.save(draft)

    val command = UpdateEventCommand(
      eventId = draft.id.value,
      title = Some("Updated Title"),
      description = Some("Updated Description"),
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      collaboratorIds = None
    )

    val result = useCase.execute(command)
    result.isRight shouldBe true

    val updatedEvent = eventRepo.events(draft.id.value)
    updatedEvent.title.map(_.value) shouldBe Some("Updated Title")
    updatedEvent.description.map(_.value) shouldBe Some("Updated Description")
    
    publisher.publishedEvents.exists(_.isInstanceOf[EventUpdated]) shouldBe true
  }

  it should "fail if event does not exist" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
    val domainService = new EventDomainService(orgRepo)
    val useCase = new UpdateEventUseCase(eventRepo, publisher, domainService)

    val command = UpdateEventCommand(
      eventId = "nonexistent", title = Some("Title"), description = None,
      tags = None, location = None, date = None, status = EventStatus.DRAFT, collaboratorIds = None
    )

    val result = useCase.execute(command)
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("not found")
  }

  it should "fail if updating with invalid collaborator organizations" in {
    val eventRepo = new FakeEventRepository()
    val orgRepo = new FakeOrganizationRepository()
    val publisher = new FakeDomainEventPublisher()
    val domainService = new EventDomainService(orgRepo)
    val useCase = new UpdateEventUseCase(eventRepo, publisher, domainService)

    val draft = Event.create(
      title = None, description = None, poster = None, tags = None, location = None, date = None,
      status = EventStatus.DRAFT, creatorId = OrganizationId.unsafe("org-1"), collaboratorIds = None
    )
    eventRepo.save(draft)

    val command = UpdateEventCommand(
      eventId = draft.id.value, title = None, description = None,
      tags = None, location = None, date = None, status = EventStatus.DRAFT, 
      collaboratorIds = Some(List("unknown-org"))
    )

    val result = useCase.execute(command)
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("not an organization")
  }
