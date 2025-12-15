package utils
import domain.commands.{CreateEventCommand, GetFilteredEventsCommand, UpdateEventCommand}
import domain.models.{Event, EventStatus, EventTag, Location}
import domain.models.EventConversions.*
import domain.models.EventTag.validateTagList

import java.nio.file.Files
import java.time.LocalDateTime
import scala.util.{Failure, Success, Try}

object Utils:

  val DEFAULT_LIMIT: Int   = 1
  val MAX_LIMIT: Int       = 2
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

  def uploadPosterToMediaService(id_event: String, posterOpt: Option[cask.FormFile], mediaServiceUrl: String): String =
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
                s"$mediaServiceUrl/events/$id_event",
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
    val price: Option[Double] = eventData.obj.get("price").map(_.num)
    val status                = EventStatus.withNameOpt(eventData("status").str).getOrElse(EventStatus.DRAFT)
    val id_creator            = eventData("id_creator").str
    val id_collaborators      = eventData.obj.get("id_collaborators").map(_.arr.map(_.str).toList).filter(_.nonEmpty)

    CreateEventCommand(
      title = title,
      description = description,
      tags = tags,
      location = location,
      date = date,
      price = price,
      status = status,
      id_creator = id_creator,
      id_collaborators = id_collaborators
    )

  def getUpdateCommandFromJson(id_event: String, newEvent: String): UpdateEventCommand =
    val eventData = ujson.read(newEvent)

    val title            = eventData.obj.get("title").map(_.str).filter(_.nonEmpty)
    val description      = eventData.obj.get("description").map(_.str).filter(_.nonEmpty)
    val tags             = eventData.obj.get("tags").map(t => validateTagList(t.toString())).flatten
    val location         = eventData.obj.get("location").map(l => parseLocationFromJson(l.toString())).flatten
    val date             = eventData.obj.get("date").map(d => LocalDateTime.parse(d.str))
    val price            = eventData.obj.get("price").map(_.num)
    val status           = EventStatus.withNameOpt(eventData("status").str).getOrElse(EventStatus.DRAFT)
    val id_collaborators = eventData.obj.get("id_collaborators").map(_.arr.map(_.str).toList).filter(_.nonEmpty)

    UpdateEventCommand(
      id_event = id_event,
      title = title,
      description = description,
      tags = tags,
      location = location,
      date = date,
      price = price,
      status = status,
      id_collaborators = id_collaborators
    )

  private def pastDate(eventDate: LocalDateTime): Boolean =
    eventDate.isBefore(LocalDateTime.now())

  def updateEventIfPastDate(event: Event): Event =
    if event.date.exists(pastDate) && event.status != EventStatus.COMPLETED then
      event.copy(status = EventStatus.COMPLETED)
    else
      event

  def parseEventFilters(
      limit: Option[Int],
      offset: Option[Int],
      status: Option[String],
      title: Option[String],
      tags: Option[List[String]],
      startDate: Option[String],
      endDate: Option[String],
      id_organization: Option[String],
      city: Option[String],
      location_name: Option[String],
      priceMin: Option[Double],
      priceMax: Option[Double]
  ): GetFilteredEventsCommand =
    val parsedStatus: Option[EventStatus] =
      status.flatMap(s => EventStatus.withNameOpt(s)).orElse(Some(EventStatus.PUBLISHED))
    val parsedTags: Option[List[EventTag]] = tags.map(_.map(t => EventTag.fromString(t)))
    val parsedStartDate: Option[LocalDateTime] = startDate.flatMap { sd =>
      Try(LocalDateTime.parse(sd)).toOption
    }
    val parsedEndDate: Option[LocalDateTime] = endDate.flatMap { ed =>
      Try(LocalDateTime.parse(ed)).toOption
    }
    val limitValue = math.min(limit.getOrElse(DEFAULT_LIMIT), MAX_LIMIT)
    val priceRange = (priceMin, priceMax) match
      case (Some(min), Some(max)) => Some((min, max))
      case (Some(min), None)      => Some((min, Double.MaxValue))
      case (None, Some(max))      => Some((0.0, max))
      case _                      => None
    GetFilteredEventsCommand(
      limit = Some(limitValue),
      offset = offset,
      status = parsedStatus,
      title = title,
      tags = parsedTags,
      startDate = parsedStartDate,
      endDate = parsedEndDate,
      id_organization = id_organization,
      city = city,
      location_name = location_name,
      priceRange = priceRange
    )

  def createPaginatedResponse(
      events: List[Event],
      limit: Option[Int] = None,
      offset: Option[Int] = None,
      hasMore: Boolean
  ): ujson.Obj =
    ujson.Obj(
      "items"   -> ujson.Arr(events.map(_.toJson)*),
      "limit"   -> limit.getOrElse(DEFAULT_LIMIT),
      "offset"  -> offset.getOrElse(0),
      "hasMore" -> hasMore
    )
