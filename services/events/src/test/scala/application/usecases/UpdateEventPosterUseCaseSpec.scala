package application.usecases

import domain.aggregates.Event
import domain.commands.UpdateEventPosterCommand
import domain.enums.EventStatus
import domain.valueobjects.OrganizationId
import infrastructure.fakes.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class UpdateEventPosterUseCaseSpec extends AnyFlatSpec with Matchers:

  "UpdateEventPosterUseCase" should "update poster URL successfully" in {
    val eventRepo = new FakeEventRepository()
    val publisher = new FakeDomainEventPublisher()
    val useCase = new UpdateEventPosterUseCase(eventRepo, publisher)

    val draft = Event.create(
      title = None, description = None, poster = None, tags = None, location = None, date = None,
      status = EventStatus.DRAFT, creatorId = OrganizationId.unsafe("org-1"), collaboratorIds = None
    )
    eventRepo.save(draft)

    val command = UpdateEventPosterCommand(
      eventId = draft.id.value,
      posterUrl = "http://new-image.jpg"
    )

    val result = useCase.execute(command)
    result.isRight shouldBe true

    eventRepo.events(draft.id.value).poster shouldBe Some("http://new-image.jpg")
  }

  it should "fail if event does not exist" in {
    val eventRepo = new FakeEventRepository()
    val publisher = new FakeDomainEventPublisher()
    val useCase = new UpdateEventPosterUseCase(eventRepo, publisher)

    val command = UpdateEventPosterCommand("nonexistent", "http://image.jpg")
    val result = useCase.execute(command)
    
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("not found")
  }

  it should "fail if poster URL is empty" in {
    val eventRepo = new FakeEventRepository()
    val publisher = new FakeDomainEventPublisher()
    val useCase = new UpdateEventPosterUseCase(eventRepo, publisher)

    val draft = Event.create(
      title = None, description = None, poster = None, tags = None, location = None, date = None,
      status = EventStatus.DRAFT, creatorId = OrganizationId.unsafe("org-1"), collaboratorIds = None
    )
    eventRepo.save(draft)

    val result = useCase.execute(UpdateEventPosterCommand(draft.id.value, "   "))
    result.isLeft shouldBe true
    result.left.getOrElse("") should include("cannot be empty")
  }
