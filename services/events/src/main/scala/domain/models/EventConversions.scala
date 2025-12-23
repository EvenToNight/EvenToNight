package domain.models

import domain.models.EventTag.validateTagList
import org.bson.Document

import java.time.{Instant, LocalDateTime}
import scala.jdk.CollectionConverters.*
import scala.util.Try

object EventConversions:

  extension (event: Event)
    def toDocument: Document =
      val doc = new Document().append("_id", event._id)

      def appendIfPresent[T](key: String, value: Option[T], transform: T => Any = identity): Unit =
        value.foreach(v => doc.append(key, transform(v)))

      appendIfPresent("title", event.title)
      appendIfPresent("description", event.description)
      appendIfPresent("poster", event.poster)
      appendIfPresent("tags", event.tags, (t: List[EventTag]) => t.map(_.displayName).asJava)
      appendIfPresent("location", event.location, localityToDocument(_))
      appendIfPresent("date", event.date, _.toString)
      appendIfPresent("price", event.price)
      doc.append("status", event.status.toString)
      doc.append("instant", event.instant.toString)
      doc.append("id_creator", event.id_creator)
      appendIfPresent("id_collaborators", event.id_collaborators, (c: List[String]) => c.asJava)

      doc

    def toJson: ujson.Value =
      val obj = ujson.Obj(
        "eventId"    -> event._id,
        "status"     -> event.status.toString,
        "instant"    -> event.instant.toString,
        "id_creator" -> event.id_creator
      )

      def addIfPresent[T](key: String, value: Option[T], transform: T => ujson.Value): Unit =
        value.filter(_ != null).foreach(v => obj(key) = transform(v))

      addIfPresent("title", event.title, ujson.Str(_))
      addIfPresent("description", event.description, ujson.Str(_))
      addIfPresent("poster", event.poster, ujson.Str(_))
      addIfPresent("tags", event.tags, (tags: List[EventTag]) => ujson.Arr(tags.map(t => ujson.Str(t.displayName))*))
      addIfPresent("location", event.location, localityToJson)
      addIfPresent("date", event.date, (d: LocalDateTime) => ujson.Str(d.toString))
      addIfPresent("price", event.price, ujson.Num(_))
      addIfPresent("id_collaborators", event.id_collaborators, (c: List[String]) => ujson.Arr(c.map(ujson.Str(_))*))
      obj

  def fromDocument(doc: Document): Event =
    val tagsString = Option(doc.getList("tags", classOf[String])).map(_.asScala.mkString(",")).getOrElse("")
    val tagList    = validateTagList(tagsString)
    Event(
      _id = doc.getString("_id"),
      title = Option(doc.getString("title")),
      description = Option(doc.getString("description")),
      poster = Option(doc.getString("poster")),
      tags = tagList,
      location = Option(doc.get("location", classOf[Document])).map(localityFromDocument),
      date = Option(doc.getString("date")).flatMap(s => Try(LocalDateTime.parse(s)).toOption),
      price = Option(doc.getDouble("price")).map(_.doubleValue),
      status = EventStatus.valueOf(doc.getString("status")),
      instant = Instant.parse(doc.getString("instant")),
      id_creator = doc.getString("id_creator"),
      id_collaborators = Option(doc.get("id_collaborators", classOf[java.util.List[String]])).map(_.asScala.toList)
    )

  private def localityToDocument(locality: Location): Document =
    val doc = new Document()
    def appendIfPresent[T](key: String, value: Option[T], transform: T => Any = identity): Unit =
      value.foreach(v => doc.append(key, transform(v)))
    appendIfPresent("name", locality.name)
    appendIfPresent("country", locality.country)
    appendIfPresent("country_code", locality.country_code)
    appendIfPresent("state", locality.state)
    appendIfPresent("province", locality.province)
    appendIfPresent("city", locality.city)
    appendIfPresent("road", locality.road)
    appendIfPresent("postcode", locality.postcode)
    appendIfPresent("house_number", locality.house_number)
    appendIfPresent("lat", locality.lat)
    appendIfPresent("lon", locality.lon)
    appendIfPresent("link", locality.link)
    doc

  private def localityToJson(locality: Location): ujson.Value =
    val obj = ujson.Obj()
    def addIfPresent[T](key: String, value: Option[T], transform: T => ujson.Value): Unit =
      value.filter(_ != null).foreach(v => obj(key) = transform(v))
    addIfPresent("name", locality.name, ujson.Str(_))
    addIfPresent("country", locality.country, ujson.Str(_))
    addIfPresent("country_code", locality.country_code, ujson.Str(_))
    addIfPresent("state", locality.state, ujson.Str(_))
    addIfPresent("province", locality.province, ujson.Str(_))
    addIfPresent("city", locality.city, ujson.Str(_))
    addIfPresent("road", locality.road, ujson.Str(_))
    addIfPresent("postcode", locality.postcode, ujson.Str(_))
    addIfPresent("house_number", locality.house_number, ujson.Str(_))
    addIfPresent("lat", locality.lat, ujson.Num(_))
    addIfPresent("lon", locality.lon, ujson.Num(_))
    addIfPresent("link", locality.link, ujson.Str(_))
    obj

  private def localityFromDocument(doc: Document): Location =
    if doc == null then Location.Nil()
    else
      Location(
        name = Option(doc.getString("name")),
        country = Option(doc.getString("country")),
        country_code = Option(doc.getString("country_code")),
        state = Option(doc.getString("state")),
        province = Option(doc.getString("province")),
        city = Option(doc.getString("city")),
        road = Option(doc.getString("road")),
        postcode = Option(doc.getString("postcode")),
        house_number = Option(doc.getString("house_number")),
        lat = Option(doc.getDouble("lat")).map(_.doubleValue),
        lon = Option(doc.getDouble("lon")).map(_.doubleValue),
        link = Option(doc.getString("link"))
      )
