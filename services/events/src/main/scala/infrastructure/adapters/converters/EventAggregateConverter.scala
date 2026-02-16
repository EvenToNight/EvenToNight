package infrastructure.adapters.converters

import domain.aggregates.Event as EventAggregate
import domain.models.{Event as EventModel, Location as LocationModel}
import domain.valueobjects.{EventDescription, EventId, EventTitle, Location, OrganizationId}

object EventAggregateConverter:

  def toModel(aggregate: EventAggregate): EventModel =
    EventModel(
      _id = aggregate.id.value,
      title = aggregate.title.map(_.value),
      description = aggregate.description.map(_.value),
      poster = aggregate.poster,
      tags = aggregate.tags,
      location = aggregate.location.map(toLocationModel),
      date = aggregate.date,
      status = aggregate.status,
      instant = aggregate.createdAt,
      creatorId = aggregate.creatorId.value,
      collaboratorIds = Some(aggregate.collaboratorIds.map(_.value)),
      isFree = aggregate.isFree
    )

  def fromModel(model: EventModel): EventAggregate =
    EventAggregate.reconstitute(
      id = EventId.unsafe(model._id),
      title = model.title.map(EventTitle.unsafe),
      description = model.description.map(EventDescription.unsafe),
      poster = model.poster,
      tags = model.tags,
      location = model.location.map(fromLocationModel),
      date = model.date,
      status = model.status,
      createdAt = model.instant,
      creatorId = OrganizationId.unsafe(model.creatorId),
      collaboratorIds = model.collaboratorIds.getOrElse(List.empty).map(OrganizationId.unsafe),
      isFree = model.isFree
    )

  private def toLocationModel(location: Location): LocationModel =
    val coords = location.coordinates
    LocationModel(
      name = location.name,
      country = location.country,
      country_code = location.countryCode,
      state = location.state,
      province = location.province,
      city = location.city,
      road = location.road,
      postcode = location.postcode,
      house_number = location.houseNumber,
      lat = coords.map(_.latitude),
      lon = coords.map(_.longitude),
      link = location.link
    )

  private def fromLocationModel(model: LocationModel): Location =
    Location.unsafe(
      name = model.name,
      country = model.country,
      countryCode = model.country_code,
      state = model.state,
      province = model.province,
      city = model.city,
      road = model.road,
      postcode = model.postcode,
      houseNumber = model.house_number,
      lat = model.lat,
      lon = model.lon,
      link = model.link
    )
