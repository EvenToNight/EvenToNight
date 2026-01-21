package infrastructure.media

import cask.FormFile
import infrastructure.Wiring.mediaBaseUrl
import infrastructure.Wiring.mediaHost

import java.nio.file.Files
import scala.util.Try

object MediaServiceClient:
  private def defaultAvatarUrl: String = s"http://${mediaBaseUrl}/users/default.png"
  def uploadAvatarToMediaService(userId: String, avatarOpt: Option[FormFile]): String =
    avatarOpt match
      case None => defaultAvatarUrl
      case Some(file) =>
        val result =
          for
            path  <- file.filePath.toRight(new Exception("Missing avatar file path"))
            bytes <- Try(Files.readAllBytes(path)).toEither
            response <- Try {
              requests.post(
                s"http://${mediaHost}/users/$userId",
                data = requests.MultiPart(
                  requests.MultiItem(name = "file", data = bytes, filename = "avatar.jpg")
                )
              )
            }.toEither
            url <- Try(s"http://${mediaBaseUrl}/" + ujson.read(response.text())("url").str).toEither
          yield url

        result.getOrElse(defaultAvatarUrl)
