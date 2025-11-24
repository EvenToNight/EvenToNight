package domain.models

import domain.models.EventTag.validateTagList
import org.bson.Document

import scala.jdk.CollectionConverters._

object EventConversions:
  extension (event: Event)
    def toDocument: Document =
      new Document()
        .append("_id", event._id)
        .append("title", event.title)
        .append("description", event.description)
        .append("poster", event.poster)
        .append("tag", event.tag.map(_.displayName).asJava)
        .append("location", event.location)
        .append("date", event.date.toString)
        .append("status", event.status.toString)
        .append("instant", event.instant.toString)
        .append("id_creator", event.id_creator)
        .append("id_collaborator", event.id_collaborator.orNull)

    def toJson: ujson.Value =
      ujson.Obj(
        "id_event"        -> event._id,
        "title"           -> event.title,
        "description"     -> event.description,
        "poster"          -> event.poster,
        "tag"             -> ujson.Arr(event.tag.map(t => ujson.Str(t.toString))*),
        "location"        -> event.location,
        "date"            -> event.date.toString,
        "status"          -> event.status.toString,
        "instant"         -> event.instant.toString,
        "id_creator"      -> event.id_creator,
        "id_collaborator" -> event.id_collaborator.getOrElse("")
      )

  def fromDocument(doc: Document): Event =
    val tagsString = doc.getList("tag", classOf[String]).asScala.mkString(",")
    println(s"Converting from Document, tagsString: $tagsString")
    val tagList = validateTagList(tagsString)
    println(s"Converted tags: $tagList")
    Event(
      _id = doc.getString("_id"),
      title = doc.getString("title"),
      description = doc.getString("description"),
      poster = doc.getString("poster"),
      tag = tagList,
      location = doc.getString("location"),
      date = java.time.LocalDateTime.parse(doc.getString("date")),
      status = EventStatus.valueOf(doc.getString("status")),
      instant = java.time.Instant.parse(doc.getString("instant")),
      id_creator = doc.getString("id_creator"),
      id_collaborator = Option(doc.getString("id_collaborator"))
    )
