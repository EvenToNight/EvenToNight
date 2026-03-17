package application.usecases

import domain.aggregates.Event
import domain.commands.DeleteEventCommand
import domain.enums.EventStatus
import domain.events.{EventCancelled, EventDeleted}
import domain.valueobjects.OrganizationId
import infrastructure.fakes.*
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class DeleteEventUseCaseSpec extends AnyFlatSpec with Matchers:

  "DeleteEventUseCase" should "hard delete a DRAFT event" in {
    val eventRepo = new FakeEventRepository()
    val publisher = new FakeDomainEventPublisher()
    val useCase   = new DeleteEventUseCase(eventRepo, publisher)

    val event = Event.create(
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-1"),
      collaboratorIds = None
    )
    eventRepo.save(event)

    val command = DeleteEventCommand(eventId = event.id.value)
    val result  = useCase.execute(command)

    result.isRight shouldBe true
    eventRepo.events.contains(event.id.value) shouldBe false
    publisher.publishedEvents.exists(_.isInstanceOf[EventDeleted]) shouldBe true
  }

  it should "soft delete (cancel) a PUBLISHED event instead of hard deleting it" in {
    val eventRepo = new FakeEventRepository()
    val publisher = new FakeDomainEventPublisher()
    val useCase   = new DeleteEventUseCase(eventRepo, publisher)

    // Build a publishable event manually
    import domain.valueobjects.{EventTitle, Location}
    import java.time.LocalDateTime

    val draft = Event.create(
      title = Some(EventTitle.unsafe("Pub Event")),
      description = None,
      poster = None,
      tags = None,
      location = Location(city = Some("Rome")).toOption,
      date = Some(LocalDateTime.now().plusDays(1)),
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-1"),
      collaboratorIds = None
    )
    val published = draft.publish("Org 1").getOrElse(fail("could not publish"))
    eventRepo.save(published)

    val command = DeleteEventCommand(eventId = published.id.value)
    val result  = useCase.execute(command)

    result.isRight shouldBe true
    eventRepo.events.contains(published.id.value) shouldBe true // Still in DB
    eventRepo.events(published.id.value).status shouldBe EventStatus.CANCELLED
    publisher.publishedEvents.exists(_.isInstanceOf[EventCancelled]) shouldBe true
    publisher.publishedEvents.exists(_.isInstanceOf[EventDeleted]) shouldBe false
  }

  it should "fail to delete a non-existing event" in {
    val eventRepo = new FakeEventRepository()
    val publisher = new FakeDomainEventPublisher()
    val useCase   = new DeleteEventUseCase(eventRepo, publisher)

    val result = useCase.execute(DeleteEventCommand("non-existent"))
    result.isLeft shouldBe true
  }

  it should "hard delete a COMPLETED event" in {
    val eventRepo = new FakeEventRepository()
    val publisher = new FakeDomainEventPublisher()
    val useCase   = new DeleteEventUseCase(eventRepo, publisher)

    import domain.valueobjects.{EventTitle, Location}
    import java.time.LocalDateTime
    val draft = Event.create(
      title = Some(EventTitle.unsafe("Pub Event")),
      description = None,
      poster = None,
      tags = None,
      location = Location(city = Some("Rome")).toOption,
      date = Some(LocalDateTime.now().plusDays(1)),
      status = EventStatus.DRAFT,
      creatorId = OrganizationId.unsafe("org-1"),
      collaboratorIds = None
    )
    val completed = draft.publish("Org 1").flatMap(_.complete()).getOrElse(fail("setup failed"))
    eventRepo.save(completed)

    val result = useCase.execute(DeleteEventCommand(completed.id.value))
    result.isRight shouldBe true
    eventRepo.events.contains(completed.id.value) shouldBe false
  }
