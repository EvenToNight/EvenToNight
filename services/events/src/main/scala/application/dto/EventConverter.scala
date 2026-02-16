package application.dto

import domain.aggregates.Event as EventAggregate
import domain.valueobjects.Location
import infrastructure.dto.{Event as EventDTO, Location as LocationDTO}

object EventConverter:

  def toDTO(event: EventAggregate): EventDTO =
    EventDTO(
      _id = event.id.value,
      title = event.title.map(_.value),
      description = event.description.map(_.value),
      poster = event.poster,
      tags = event.tags,
      location = event.location.map(toLocationDTO),
      date = event.date,
      status = event.status,
      instant = event.createdAt,
      creatorId = event.creatorId.value,
      collaboratorIds = Some(event.collaboratorIds.map(_.value)),
      isFree = event.isFree
    )

  def toDTOList(events: List[EventAggregate]): List[EventDTO] =
    events.map(toDTO)

  private def toLocationDTO(location: Location): LocationDTO =
    val coords = location.coordinates
    LocationDTO(
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
