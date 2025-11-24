package controller.routes

import domain.commands.CreateEventDraftCommand
import domain.commands.UpdateEventPosterCommand
import domain.models.EventTag.validateTagList
import service.EventService
import ujson.Obj

import java.time.LocalDateTime

class EventCommandApi(eventService: EventService) extends BaseRoutes:

  private val mediaServiceUrl = "http://media:9020"

  @cask.postForm("/event")
  def createDraft(
      title: String,
      description: String,
      poster: cask.FormFile,
      tags: String,
      location: String,
      date: String,
      id_creator: String,
      id_collaborator: Option[String] = None
  ): ujson.Value =
    val tagList = validateTagList(tags)
    val command = CreateEventDraftCommand(
      title = title,
      description = description,
      poster = "",
      tag = tagList,
      location = location,
      date = LocalDateTime.parse(date),
      id_creator = id_creator,
      id_collaborator = id_collaborator.filter(_.nonEmpty)
    )

    val eventId = eventService.handleCommand(command) match
      case Right(id: String) => id
      case _                 => ""

    val posterUrl =
      try
        val fileBytesOpt = poster.filePath.map(path => java.nio.file.Files.readAllBytes(path))

        fileBytesOpt match
          case Some(fileBytes) =>
            val response = requests.post(
              s"$mediaServiceUrl/events/$eventId",
              data = requests.MultiPart(
                requests.MultiItem(
                  name = "file",
                  data = fileBytes,
                  filename = poster.fileName
                )
              )
            )
            ujson.read(response.text())("url").str
          case None =>
            s"/events/$eventId/default.jpg"
      catch
        case e: Exception =>
          println(s"Error upload poster: ${e.getMessage}")
          s"/events/$eventId/default.jpg"

    val updateCommand = UpdateEventPosterCommand(
      eventId = eventId,
      posterUrl = posterUrl
    )

    eventService.handleCommand(updateCommand)

    Obj("id_event" -> eventId)

  initialize()
