package utils
import domain.commands.{CreateEventCommand, UpdateEventCommand}
import domain.models.{Event, EventStatus, Location}
import domain.models.EventTag.validateTagList

import java.nio.file.Files
import java.time.LocalDateTime
import scala.util.{Failure, Success, Try}

object Utils:

  def parseLocationFromJson(locationJson: String): Location =
    Try {
      val json = ujson.read(locationJson)
      Location(
        name = json.obj.get("name").map(_.str).getOrElse(""),
        country = json.obj.get("country").map(_.str).getOrElse(""),
        country_code = json.obj.get("country_code").map(_.str).getOrElse(""),
        state = json.obj.get("state").map(_.str).getOrElse(""),
        province = json.obj.get("province").map(_.str).getOrElse(""),
        city = json.obj.get("city").map(_.str).getOrElse(""),
        road = json.obj.get("road").map(_.str).getOrElse(""),
        postcode = json.obj.get("postcode").map(_.str).getOrElse(""),
        house_number = json.obj.get("house_number").map(_.str).getOrElse(""),
        lat = json.obj.get("lat").map(_.num).getOrElse(0.0),
        lon = json.obj.get("lon").map(_.num).getOrElse(0.0),
        link = json.obj.get("link").map(_.str).getOrElse("")
      )
    } match
      case Success(locality) => locality
      case Failure(_)        => println("Failed to parse location JSON"); Location.Nil()

  def uploadPosterToMediaService(id_event: String, poster: cask.FormFile, mediaServiceUrl: String): String =
    def defaultUrl = s"/events/$id_event/default.jpg"
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
                filename = s"${id_event}_poster.jpg"
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
    try
      val eventData = ujson.read(event)

      val title           = eventData("title").str
      val description     = eventData("description").str
      val tags            = validateTagList(eventData("tags").toString())
      val locationData    = eventData("location")
      val location        = parseLocationFromJson(locationData.toString())
      val date            = LocalDateTime.parse(eventData("date").str)
      val price           = eventData("price").num
      val status          = EventStatus.withNameOpt(eventData("status").str).getOrElse(EventStatus.DRAFT)
      val id_creator      = eventData("id_creator").str
      val id_collaborator = eventData.obj.get("id_collaborator").map(_.str).filter(_.nonEmpty)

      CreateEventCommand(
        title = title,
        description = description,
        poster = "",
        tag = tags,
        location = location,
        date = date,
        price = price,
        status = status,
        id_creator = id_creator,
        id_collaborator = id_collaborator
      )
    catch
      case e: Exception =>
        println(s"Error parsing CreateEventCommand from JSON: ${e.getMessage}")
        CreateEventCommand(
          title = "",
          description = "",
          poster = "",
          tag = List(),
          location = Location.Nil(),
          date = LocalDateTime.MIN,
          price = 0.0,
          status = EventStatus.DRAFT,
          id_creator = "",
          id_collaborator = None
        )

  def getUpdateCommandFromJson(id_event: String, newEvent: String): UpdateEventCommand =
    try
      val eventData = ujson.read(newEvent)

      val title           = eventData.obj.get("title").map(_.str).filter(_.nonEmpty)
      val description     = eventData.obj.get("description").map(_.str).filter(_.nonEmpty)
      val tags            = eventData.obj.get("tags").map(t => validateTagList(t.toString()))
      val location        = eventData.obj.get("location").map(l => parseLocationFromJson(l.toString()))
      val date            = eventData.obj.get("date").map(d => LocalDateTime.parse(d.str))
      val price           = eventData.obj.get("price").map(_.num)
      val status          = eventData.obj.get("status").flatMap(s => EventStatus.withNameOpt(s.str))
      val id_collaborator = eventData.obj.get("id_collaborator").map(_.str).filter(_.nonEmpty)

      UpdateEventCommand(
        id_event = id_event,
        title = title,
        description = description,
        tag = tags,
        location = location,
        date = date,
        price = price,
        status = status,
        id_collaborator = id_collaborator
      )
    catch
      case e: Exception =>
        println(s"Error parsing UpdateEventCommand from JSON: ${e.getMessage}")
        UpdateEventCommand(
          id_event = id_event,
          title = None,
          description = None,
          tag = None,
          location = None,
          date = None,
          price = None,
          status = None,
          id_collaborator = None
        )

  private def pastDate(eventDate: LocalDateTime): Boolean =
    eventDate.isBefore(LocalDateTime.now())

  def updateEventIfPastDate(event: Event): Event =
    if pastDate(event.date) && event.status != EventStatus.COMPLETED then
      event.copy(status = EventStatus.COMPLETED)
    else
      event
