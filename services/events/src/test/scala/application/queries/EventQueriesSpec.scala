package application.queries

import domain.aggregates.Event
import domain.commands.{GetEventCommand, GetFilteredEventsCommand}
import domain.enums.EventStatus
import domain.valueobjects.OrganizationId
import infrastructure.fakes.FakeEventRepository
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventQueriesSpec extends AnyFlatSpec with Matchers:

  "GetEventQuery" should "return an event if it exists" in {
    val repo = new FakeEventRepository()
    val event = Event.create(
      title = None,
      description = None,
      poster = None,
      tags = None,
      location = None,
      date = None,
      status = EventStatus.PUBLISHED,
      creatorId = OrganizationId.unsafe("org-1"),
      collaboratorIds = None
    )
    repo.save(event)

    val query  = new GetEventQuery(repo)
    val result = query.execute(GetEventCommand(event.id.value))

    result.isRight shouldBe true
    result.getOrElse(fail()).id shouldBe event.id
  }

  it should "return an error if event does not exist" in {
    val repo   = new FakeEventRepository()
    val query  = new GetEventQuery(repo)
    val result = query.execute(GetEventCommand("missing-id"))

    result.isLeft shouldBe true
  }

  "GetAllEventsQuery" should "return all published events" in {
    val repo = new FakeEventRepository()
    val event1 =
      Event.create(None, None, None, None, None, None, EventStatus.PUBLISHED, OrganizationId.unsafe("org-1"), None)
    val event2 =
      Event.create(None, None, None, None, None, None, EventStatus.DRAFT, OrganizationId.unsafe("org-1"), None)
    repo.save(event1)
    repo.save(event2)

    val query  = new GetAllEventsQuery(repo)
    val result = query.execute()

    result.isRight shouldBe true
    result.getOrElse(fail()).length shouldBe 1
    result.getOrElse(fail()).head.id shouldBe event1.id
  }

  "GetFilteredEventsQuery" should "filter events correctly" in {
    val repo  = new FakeEventRepository()
    val query = new GetFilteredEventsQuery(repo)
    val command = GetFilteredEventsCommand(
      limit = Some(10),
      offset = Some(0),
      status = Some(List(EventStatus.PUBLISHED)),
      title = Some("Title"),
      tags = None,
      startDate = None,
      endDate = None,
      organizationId = None,
      city = None,
      location_name = None,
      sortBy = None,
      sortOrder = None,
      query = None,
      near = None,
      other = None,
      price = None
    )
    val result = query.execute(command)

    result.isRight shouldBe true
    result.toOption.get._1.isEmpty shouldBe true
    result.toOption.get._2 shouldBe false
  }
