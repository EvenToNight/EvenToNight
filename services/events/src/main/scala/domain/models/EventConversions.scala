package domain.models

import domain.models.EventTag.validateTagList
import org.bson.Document

import scala.jdk.CollectionConverters.*

object EventConversions:

  private def getDoubleValue(doc: Document, key: String): Double =
    Option(doc.get(key)) match
      case Some(value: java.lang.Integer) => value.doubleValue()
      case Some(value: java.lang.Double)  => value.doubleValue()
      case Some(value: java.lang.Number)  => value.doubleValue()
      case _                              => 0.0

  extension (event: Event)
    def toDocument: Document =
      new Document()
        .append("_id", event._id)
        .append("title", event.title)
        .append("description", event.description)
        .append("poster", event.poster)
        .append("tag", event.tag.map(_.displayName).asJava)
        .append("location", localityToDocument(event.location))
        .append("date", event.date.toString)
        .append("price", event.price)
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
        "location"        -> localityToJson(event.location),
        "date"            -> event.date.toString,
        "price"           -> event.price,
        "status"          -> event.status.toString,
        "instant"         -> event.instant.toString,
        "id_creator"      -> event.id_creator,
        "id_collaborator" -> event.id_collaborator.getOrElse("")
      )

  def fromDocument(doc: Document): Event =
    val tagsString = doc.getList("tag", classOf[String]).asScala.mkString(",")
    val tagList    = validateTagList(tagsString)
    Event(
      _id = doc.getString("_id"),
      title = doc.getString("title"),
      description = doc.getString("description"),
      poster = doc.getString("poster"),
      tag = tagList,
      location = localityFromDocument(doc.get("location", classOf[Document])),
      date = java.time.LocalDateTime.parse(doc.getString("date")),
      price = getDoubleValue(doc, "price"),
      status = EventStatus.valueOf(doc.getString("status")),
      instant = java.time.Instant.parse(doc.getString("instant")),
      id_creator = doc.getString("id_creator"),
      id_collaborator = Option(doc.getString("id_collaborator"))
    )

  private def localityToDocument(locality: Location): Document =
    new Document()
      .append("name", locality.name)
      .append("country", locality.country)
      .append("country_code", locality.country_code)
      .append("state", locality.state)
      .append("province", locality.province)
      .append("city", locality.city)
      .append("road", locality.road)
      .append("postcode", locality.postcode)
      .append("house_number", locality.house_number)
      .append("lat", locality.lat)
      .append("lon", locality.lon)
      .append("link", locality.link)

  private def localityToJson(locality: Location): ujson.Value =
    ujson.Obj(
      "name"         -> locality.name,
      "country"      -> locality.country,
      "country_code" -> locality.country_code,
      "state"        -> locality.state,
      "province"     -> locality.province,
      "city"         -> locality.city,
      "road"         -> locality.road,
      "postcode"     -> locality.postcode,
      "house_number" -> locality.house_number,
      "lat"          -> locality.lat,
      "lon"          -> locality.lon,
      "link"         -> locality.link
    )

  private def localityFromDocument(doc: Document): Location =
    if doc == null then Location.Nil()
    else
      Location(
        name = Option(doc.getString("name")).getOrElse(""),
        country = Option(doc.getString("country")).getOrElse(""),
        country_code = Option(doc.getString("country_code")).getOrElse(""),
        state = Option(doc.getString("state")).getOrElse(""),
        province = Option(doc.getString("province")).getOrElse(""),
        city = Option(doc.getString("city")).getOrElse(""),
        road = Option(doc.getString("road")).getOrElse(""),
        postcode = Option(doc.getString("postcode")).getOrElse(""),
        house_number = Option(doc.getString("house_number")).getOrElse(""),
        lat = getDoubleValue(doc, "lat"),
        lon = getDoubleValue(doc, "lon"),
        link = Option(doc.getString("link")).getOrElse("")
      )
