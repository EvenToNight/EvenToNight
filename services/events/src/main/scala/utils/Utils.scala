package utils
import domain.commands.{CreateEventCommand, GetFilteredEventsCommand, UpdateEventCommand}
import domain.models.{EventStatus, EventTag}
import domain.models.EventTag.validateTagList
import infrastructure.converters.EventConversions.*
import infrastructure.db.MongoUserMetadataRepository
import infrastructure.dto.{Event, Location}

import java.nio.file.Files
import java.time.LocalDateTime
import scala.util.{Failure, Success, Try}

object Utils:

  val DEFAULT_LIMIT: Int   = 10
  val MAX_LIMIT: Int       = 20
  val DEFAULT_DATE: String = "2027-01-01T00:00:00"

  def parseLocationFromJson(locationJson: String): Option[Location] =
    Try {
      val json = ujson.read(locationJson)
      Location(
        name = json.obj.get("name").map(_.str),
        country = json.obj.get("country").map(_.str),
        country_code = json.obj.get("country_code").map(_.str),
        state = json.obj.get("state").map(_.str),
        province = json.obj.get("province").map(_.str),
        city = json.obj.get("city").map(_.str),
        road = json.obj.get("road").map(_.str),
        postcode = json.obj.get("postcode").map(_.str),
        house_number = json.obj.get("house_number").map(_.str),
        lat = json.obj.get("lat").map(_.num),
        lon = json.obj.get("lon").map(_.num),
        link = json.obj.get("link").map(_.str)
      )
    } match
      case Success(location) => Some(location)
      case Failure(_)        => println("Failed to parse location JSON"); None

  def uploadPosterToMediaService(eventId: String, posterOpt: Option[cask.FormFile], mediaServiceUrl: String): String =
    def defaultUrl = "events/default.jpg"
    posterOpt match
      case None => defaultUrl
      case Some(poster) =>
        val result =
          for
            path      <- poster.filePath.toRight(new Exception("Missing poster filepath"))
            fileBytes <- Try(Files.readAllBytes(path)).toEither
            response <- Try {
              requests.post(
                s"$mediaServiceUrl/events/$eventId",
                data = requests.MultiPart(
                  requests.MultiItem(
                    name = "file",
                    data = fileBytes,
                    filename = "poster.jpg"
                  )
                )
              )
            }.toEither
            url <- Try(ujson.read(response.text())("url").str).toEither
          yield url

        result match
          case Right(url) => url
          case Left(_)    => defaultUrl

  def getCreateCommandFromJson(event: String): CreateEventCommand =
    val eventData = ujson.read(event)

    val title: Option[String]        = eventData.obj.get("title").map(_.str)
    val description: Option[String]  = eventData.obj.get("description").map(_.str)
    val tags: Option[List[EventTag]] = validateTagList(eventData.obj.get("tags").map(_.toString()).getOrElse(""))
    val location: Option[Location] = eventData.obj.get("location").map(l => parseLocationFromJson(l.toString())).flatten
    val date: Option[LocalDateTime] = eventData.obj.get("date") match
      case Some(d) => Some(LocalDateTime.parse(d.str))
      case None    => None
    val status          = EventStatus.withNameOpt(eventData("status").str).getOrElse(EventStatus.DRAFT)
    val creatorId       = eventData("creatorId").str
    val collaboratorIds = eventData.obj.get("collaboratorIds").map(_.arr.map(_.str).toList).filter(_.nonEmpty)

    CreateEventCommand(
      title = title,
      description = description,
      tags = tags,
      location = location,
      date = date,
      status = status,
      creatorId = creatorId,
      collaboratorIds = collaboratorIds
    )

  def getUpdateCommandFromJson(eventId: String, newEvent: String): UpdateEventCommand =
    val eventData = ujson.read(newEvent)

    val title           = eventData.obj.get("title").map(_.str).filter(_.nonEmpty)
    val description     = eventData.obj.get("description").map(_.str).filter(_.nonEmpty)
    val tags            = eventData.obj.get("tags").map(t => validateTagList(t.toString())).flatten
    val location        = eventData.obj.get("location").map(l => parseLocationFromJson(l.toString())).flatten
    val date            = eventData.obj.get("date").map(d => LocalDateTime.parse(d.str))
    val status          = EventStatus.withNameOpt(eventData("status").str).getOrElse(EventStatus.DRAFT)
    val collaboratorIds = eventData.obj.get("collaboratorIds").map(_.arr.map(_.str).toList).filter(_.nonEmpty)

    UpdateEventCommand(
      eventId = eventId,
      title = title,
      description = description,
      tags = tags,
      location = location,
      date = date,
      status = status,
      collaboratorIds = collaboratorIds
    )

  private def pastDate(eventDate: LocalDateTime): Boolean =
    eventDate.isBefore(LocalDateTime.now())

  def updateEventIfPastDate(event: Event): Event =
    if event.date.exists(pastDate) && event.status == EventStatus.PUBLISHED then
      event.copy(status = EventStatus.COMPLETED)
    else
      event

  def parseEventFilters(
      limit: Option[Int],
      offset: Option[Int],
      status: Option[List[String]],
      title: Option[String],
      tags: Option[List[String]],
      startDate: Option[String],
      endDate: Option[String],
      organizationId: Option[String],
      city: Option[String],
      location_name: Option[String],
      sortBy: Option[String],
      sortOrder: Option[String],
      query: Option[String],
      near: Option[String],
      other: Option[String],
      price: Option[String],
      isAuthenticated: Boolean
  ): GetFilteredEventsCommand =
    val parsedStatus: Option[List[EventStatus]] = isAuthenticated match
      case true =>
        status.map(
          _.flatMap(s => s.split(",").map(_.trim))
            .flatMap(str => EventStatus.withNameOpt(str.trim))
        ).filter(_.nonEmpty)
      case false =>
        status.map(
          _.flatMap(s => s.split(",").map(_.trim))
            .flatMap(str => EventStatus.withNameOpt(str.trim))
        ).filter(_.nonEmpty).orElse(Some(List(EventStatus.PUBLISHED)))

    val parsedTags: Option[List[EventTag]] = tags.map(
      _.flatMap(t => t.split(",").map(_.trim))
        .map(t => EventTag.fromString(t))
    )

    val parsedStartDate: Option[LocalDateTime] = startDate.flatMap { sd =>
      Try(LocalDateTime.parse(sd)).toOption
    }
    val parsedEndDate: Option[LocalDateTime] = endDate.flatMap { ed =>
      Try(LocalDateTime.parse(ed)).toOption
    }
    val limitValue = math.min(limit.getOrElse(DEFAULT_LIMIT), MAX_LIMIT)
    val validSortBy = sortBy.filter(s =>
      Set("date", "instant", "title", "price").contains(s.toLowerCase)
    )
    val validSortOrder = sortOrder.filter(o =>
      Set("asc", "desc").contains(o.toLowerCase)
    ).map(_.toLowerCase)

    val parsedNear: Option[(Double, Double)] = near.flatMap { coords =>
      coords.split(",").map(_.trim) match
        case Array(lat, lon) =>
          Try((lat.toDouble, lon.toDouble)).toOption
        case _ => None
    }

    val parsedPrice: Option[(Double, Double)] = price.flatMap { priceRange =>
      priceRange.split(",").map(_.trim) match
        case Array(min, max) =>
          Try((min.toDouble, max.toDouble)).toOption
        case _ => None
    }

    GetFilteredEventsCommand(
      limit = Some(limitValue),
      offset = offset,
      status = parsedStatus,
      title = title,
      tags = parsedTags,
      startDate = parsedStartDate,
      endDate = parsedEndDate,
      organizationId = organizationId,
      city = city,
      location_name = location_name,
      sortBy = validSortBy,
      sortOrder = validSortOrder,
      query = query,
      near = parsedNear,
      other = other,
      price = parsedPrice
    )

  def createPaginatedResponse(
      events: List[Event],
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      hasMore: Boolean
  ): ujson.Obj =
    val limitValue = math.min(limit.getOrElse(DEFAULT_LIMIT), MAX_LIMIT)
    ujson.Obj(
      "items"   -> ujson.Arr(events.map(_.toJson)*),
      "limit"   -> limitValue,
      "offset"  -> offset.getOrElse(0),
      "hasMore" -> hasMore
    )

  def checkUserIsOrganization(userId: String, userMetadataDatabase: MongoUserMetadataRepository): Boolean =
    userMetadataDatabase.findById(userId) match
      case Some(userMetadata) if userMetadata.role == "organization" => true
      case _                                                         => false
