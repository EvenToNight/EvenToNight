package infrastructure.fakes

import domain.aggregates.Event
import domain.enums.EventStatus
import domain.events.DomainEvent
import domain.repositories.{
  DomainEventPublisher,
  EventRepository,
  OrganizationRepository,
  TransactionContext,
  UnitOfWork
}
import domain.valueobjects.{EventId, OrganizationId}

import java.time.LocalDateTime

object DummyTransactionContext extends TransactionContext

class FakeUnitOfWork extends UnitOfWork:
  override def execute[T](operation: TransactionContext => Either[String, T]): Either[String, T] =
    operation(DummyTransactionContext)

class FakeDomainEventPublisher extends DomainEventPublisher:
  var publishedEvents: List[DomainEvent] = List.empty

  override def publish(event: DomainEvent): Unit =
    publishedEvents = publishedEvents :+ event

class FakeOrganizationRepository extends OrganizationRepository:
  var existingOrgs: Set[String]     = Set("org-1", "org-2")
  var orgNames: Map[String, String] = Map("org-1" -> "First Org", "org-2" -> "Second Org")

  override def isOrganization(id: OrganizationId): Boolean = existingOrgs.contains(id.value)

  override def isOrganization(id: OrganizationId, ctx: TransactionContext): Boolean =
    isOrganization(id)

  override def getOrganizationName(id: OrganizationId): Option[String] = orgNames.get(id.value)

class FakeEventRepository extends EventRepository:
  var events: Map[String, Event] = Map.empty
  var saveFailures: Boolean      = false

  override def save(event: Event): Either[String, Unit] =
    if saveFailures then Left("Simulated save failure")
    else
      events = events + (event.id.value -> event)
      Right(())

  override def save(event: Event, ctx: TransactionContext): Either[String, Unit] = save(event)

  override def findById(eventId: EventId): Option[Event] = events.get(eventId.value)

  override def delete(eventId: EventId): Either[String, Unit] =
    events = events - eventId.value
    Right(())

  override def findAllPublished(): Either[String, List[Event]] =
    Right(events.values.filter(_.status == EventStatus.PUBLISHED).toList)

  override def findByCreator(creatorId: OrganizationId): List[Event] =
    events.values.filter(_.creatorId == creatorId).toList

  override def findByFilters(
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      status: Option[List[EventStatus]] = None,
      title: Option[String] = None,
      tags: Option[List[String]] = None,
      startDate: Option[LocalDateTime] = None,
      endDate: Option[LocalDateTime] = None,
      organizationId: Option[String] = None,
      city: Option[String] = None,
      locationName: Option[String] = None,
      sortBy: Option[String] = None,
      sortOrder: Option[String] = None,
      query: Option[String] = None,
      near: Option[(Double, Double)] = None,
      other: Option[String] = None,
      priceRange: Option[(Double, Double)] = None
  ): Either[String, (List[Event], Boolean)] = Right((events.values.toList, false))
