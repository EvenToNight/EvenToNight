package utils
import domain.models.Location

import java.nio.file.Files
import scala.util.Failure
import scala.util.Success
import scala.util.Try

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
