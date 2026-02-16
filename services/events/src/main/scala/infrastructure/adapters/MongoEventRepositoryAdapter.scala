package infrastructure.adapters

import domain.aggregates.Event as EventAggregate
import domain.models.EventStatus
import domain.repositories.{EventRepository as DomainEventRepository, TransactionContext}
import domain.valueobjects.{EventId, OrganizationId}
import infrastructure.adapters.converters.EventAggregateConverter
import infrastructure.db.MongoEventRepository as InfraEventRepo

import java.time.LocalDateTime

class MongoEventRepositoryAdapter(
    private val infraRepository: InfraEventRepo
) extends DomainEventRepository:

  override def save(event: EventAggregate): Either[String, Unit] =
    val model = EventAggregateConverter.toModel(event)
    infraRepository.save(model) match
      case Right(_) => Right(())
      case Left(ex) => Left(s"Failed to save event: ${ex.getMessage}")

  override def save(event: EventAggregate, ctx: TransactionContext): Either[String, Unit] =
    ctx match
      case mongoCtx: MongoTransactionContext =>
        val model = EventAggregateConverter.toModel(event)
        infraRepository.save(model, mongoCtx.session) match
          case Right(_) => Right(())
          case Left(ex) => Left(s"Failed to save event: ${ex.getMessage}")
      case _ =>
        // Fallback to non-transactional save
        save(event)

  override def findById(eventId: EventId): Option[EventAggregate] =
    infraRepository.findById(eventId.value).map(EventAggregateConverter.fromModel)

  override def delete(eventId: EventId): Either[String, Unit] =
    infraRepository.delete(eventId.value) match
      case Right(_) => Right(())
      case Left(ex) => Left(s"Failed to delete event: ${ex.getMessage}")

  override def findAllPublished(): Either[String, List[EventAggregate]] =
    infraRepository.findAllPublished() match
      case Right(models) => Right(models.map(EventAggregateConverter.fromModel))
      case Left(ex)      => Left(s"Failed to find published events: ${ex.getMessage}")

  override def findByCreator(creatorId: OrganizationId): List[EventAggregate] =
    // This would need to be implemented in infrastructure repository
    // For now, return empty list or filter from findAllPublished
    List.empty

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
  ): Either[String, (List[EventAggregate], Boolean)] =
    infraRepository.findByFilters(
      limit = limit,
      offset = offset,
      status = status,
      title = title,
      tags = tags,
      startDate = startDate.map(_.toString),
      endDate = endDate.map(_.toString),
      organizationId = organizationId,
      city = city,
      location_name = locationName,
      sortBy = sortBy,
      sortOrder = sortOrder,
      query = query,
      near = near,
      other = other,
      price = priceRange
    ) match
      case Right((models, hasMore)) =>
        Right((models.map(EventAggregateConverter.fromModel), hasMore))
      case Left(ex) =>
        Left(s"Failed to find events by filters: ${ex.getMessage}")
