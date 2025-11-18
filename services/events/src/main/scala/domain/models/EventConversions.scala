package domain.models

import org.bson.Document

import scala.jdk.CollectionConverters._

object EventConversions:
  extension (event: Event)
    def toDocument: Document = {
      new Document()
        .append("_id", event._id)
        .append("title", event.title)
        .append("description", event.description)
        .append("poster", event.poster)
        .append("tag", event.tag.map(_.toString).asJava)
        .append("location", event.location)
        .append("date", event.date.toString)
        .append("status", event.status.toString)
        .append("instant", event.instant.toString)
        .append("id_creator", event.id_creator)
        .append("id_collaborator", event.id_collaborator.orNull)
    }
