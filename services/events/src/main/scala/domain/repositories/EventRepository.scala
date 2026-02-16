package domain.repositories

import domain.aggregates.Event
import domain.models.EventStatus
import domain.valueobjects.{EventId, OrganizationId}

import java.time.LocalDateTime

trait EventRepository:

  def save(event: Event): Either[String, Unit]

  def save(event: Event, ctx: TransactionContext): Either[String, Unit]

  def findById(eventId: EventId): Option[Event]

  def delete(eventId: EventId): Either[String, Unit]

  def findAllPublished(): Either[String, List[Event]]

  def findByCreator(creatorId: OrganizationId): List[Event]

  def findByFilters(
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
  ): Either[String, (List[Event], Boolean)]
