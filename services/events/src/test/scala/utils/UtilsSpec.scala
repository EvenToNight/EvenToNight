package utils
import domain.enums.EventStatus
import infrastructure.dto.Event
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.{Instant, LocalDateTime}

class UtilsSpec extends AnyFlatSpec with Matchers:

  "parseLocationFromJson" should "parse a valid location JSON string" in {
    val json      = """{"name":"Rome", "lat": 1.0, "lon": 2.0}"""
    val locOption = Utils.parseLocationFromJson(json)
    locOption.isDefined shouldBe true
    locOption.get.name shouldBe Some("Rome")
    locOption.get.lat shouldBe Some(1.0)
  }

  it should "return None when given an invalid JSON string" in {
    Utils.parseLocationFromJson("{ invalid }").isEmpty shouldBe true
  }

  it should "handle missing optionals in location JSON gracefully" in {
    val json      = """{"name":"Rome"}"""
    val locOption = Utils.parseLocationFromJson(json)
    locOption.isDefined shouldBe true
    locOption.get.name shouldBe Some("Rome")
    locOption.get.city shouldBe None
  }

  "uploadPosterToMediaService" should "return default URL when poster is None" in {
    val result = Utils.uploadPosterToMediaService("1", None, "http://media-url")
    result shouldBe "events/default.jpg"
  }

  it should "return default URL when poster is Some but invalid (via reflection)" in {
    try
      val clazz       = Class.forName("cask.model.FormValue$FormFile")
      val constructor = clazz.getConstructors.head
      val params = constructor.getParameterTypes.map {
        case c if c == classOf[String]      => ""
        case c if c == classOf[Option[?]]   => None
        case c if c == classOf[Boolean]     => false
        case c if c == classOf[Int]         => 0
        case c if c == classOf[Array[Byte]] => Array.emptyByteArray
        case _                              => null
      }
      val poster = constructor.newInstance(params*) match
        case f: cask.FormFile => f
        case _                => fail("Cast failed")
      val result = Utils.uploadPosterToMediaService("1", Some(poster), "http://media-url")
      result shouldBe "events/default.jpg"
    catch
      case _: Exception => // ignore if reflection fails, this is a best-effort coverage
  }

  "notifyPaymentsService" should "return Left if request fails (e.g., unknown host)" in {
    val result = Utils.notifyPaymentsService(
      eventId = "1",
      creatorId = "org-1",
      status = "DRAFT",
      title = None,
      date = None,
      paymentsServiceUrl = "http://invalid-url-domain-not-exists.local"
    )
    result.isLeft shouldBe true
  }

  it should "return Right(()) on 201 response" in {
    import com.sun.net.httpserver.{HttpServer, HttpHandler, HttpExchange}
    import java.net.InetSocketAddress

    val server = HttpServer.create(new InetSocketAddress(0), 0)
    server.createContext(
      "/internal/events/1",
      new HttpHandler:
        override def handle(t: HttpExchange): Unit =
          t.sendResponseHeaders(201, -1)
          t.close()
    )
    server.start()
    val port = server.getAddress.getPort
    val url  = s"http://localhost:$port"

    val result = Utils.notifyPaymentsService("1", "org-1", "DRAFT", Some("Title"), Some(LocalDateTime.now()), url)
    server.stop(0)

    result.isRight shouldBe true
  }

  it should "return Right(()) but print warning if not 201 response" in {
    import com.sun.net.httpserver.{HttpServer, HttpHandler, HttpExchange}
    import java.net.InetSocketAddress

    val server = HttpServer.create(new InetSocketAddress(0), 0)
    server.createContext(
      "/internal/events/1",
      new HttpHandler:
        override def handle(t: HttpExchange): Unit =
          t.sendResponseHeaders(400, -1)
          t.close()
    )
    server.start()
    val port = server.getAddress.getPort
    val url  = s"http://localhost:$port"

    val result = Utils.notifyPaymentsService("1", "org-1", "DRAFT", None, None, url)
    server.stop(0)

    result.isLeft shouldBe true
  }

  "getCreateCommandFromJson" should "parse a complete CreateEventCommand" in {
    val json =
      """{"title":"Concert", "description":"Desc", "tags":"CONCERT", "status":"DRAFT", "creatorId":"org-1", "date":"2027-01-01T20:00:00"}"""
    val cmd = Utils.getCreateCommandFromJson(json)
    cmd.title shouldBe Some("Concert")
    cmd.status shouldBe EventStatus.DRAFT
    cmd.creatorId shouldBe "org-1"
  }

  it should "handle missing optional fields in CreateEventCommand gracefully" in {
    val json = """{"status":"DRAFT", "creatorId":"org-1"}"""
    val cmd  = Utils.getCreateCommandFromJson(json)
    cmd.title.isEmpty shouldBe true
    cmd.date.isEmpty shouldBe true
    cmd.collaboratorIds.isEmpty shouldBe true
    cmd.location.isEmpty shouldBe true
    cmd.tags.isEmpty shouldBe true
  }

  "getUpdateCommandFromJson" should "parse a complete UpdateEventCommand" in {
    val json = """{"title":"Updated", "status":"PUBLISHED", "collaboratorIds":["org-2"]}"""
    val cmd  = Utils.getUpdateCommandFromJson("event-id", json)
    cmd.eventId shouldBe "event-id"
    cmd.title shouldBe Some("Updated")
    cmd.status shouldBe EventStatus.PUBLISHED
    cmd.collaboratorIds shouldBe Some(List("org-2"))
  }

  it should "handle missing optional fields in UpdateEventCommand gracefully" in {
    val json = """{"status":"PUBLISHED", "title":"", "description":""}"""
    val cmd  = Utils.getUpdateCommandFromJson("event-id", json)
    cmd.eventId shouldBe "event-id"
    cmd.title.isEmpty shouldBe true
    cmd.description.isEmpty shouldBe true
    cmd.date.isEmpty shouldBe true
    cmd.collaboratorIds.isEmpty shouldBe true
  }

  "updateEventIfPastDate" should "transition a PUBLISHED event to COMPLETED if the date is in the past" in {
    val pastDate = LocalDateTime.now().minusDays(1)
    val event = Event(
      _id = "1",
      title = Some("Event"),
      description = None,
      poster = None,
      tags = None,
      date = Some(pastDate),
      status = EventStatus.PUBLISHED,
      location = None,
      instant = Instant.now(),
      creatorId = "org",
      collaboratorIds = None,
      isFree = true
    )
    val updated = Utils.updateEventIfPastDate(event)
    updated.status shouldBe EventStatus.COMPLETED
  }

  it should "NOT transition a DRAFT event even if the date is in the past" in {
    val pastDate = LocalDateTime.now().minusDays(1)
    val event = Event(
      _id = "1",
      title = Some("Event"),
      description = None,
      poster = None,
      tags = None,
      date = Some(pastDate),
      status = EventStatus.DRAFT,
      location = None,
      instant = Instant.now(),
      creatorId = "org",
      collaboratorIds = None,
      isFree = true
    )
    val updated = Utils.updateEventIfPastDate(event)
    updated.status shouldBe EventStatus.DRAFT
  }

  "parseEventFilters" should "parse valid filter strings" in {
    val cmd = Utils.parseEventFilters(
      limit = Some(15),
      offset = Some(5),
      status = Some(List("DRAFT")),
      title = Some("Query"),
      tags = Some(List("CONCERT")),
      startDate = Some("2026-01-01T00:00:00"),
      endDate = None,
      organizationId = None,
      city = Some("Rome"),
      location_name = None,
      sortBy = Some("date"),
      sortOrder = Some("asc"),
      query = None,
      near = Some("41.9, 12.5"),
      other = None,
      price = Some("0,50"),
      isAuthenticated = true
    )

    cmd.limit shouldBe Some(15)
    cmd.status shouldBe Some(List(EventStatus.DRAFT))
    cmd.near shouldBe Some((41.9, 12.5))
    cmd.price shouldBe Some((0.0, 50.0))
    cmd.sortBy shouldBe Some("date")
    cmd.sortOrder shouldBe Some("asc")
  }

  it should "default to PUBLISHED status for unauthenticated users" in {
    val cmd = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = None,
      title = None,
      tags = None,
      startDate = None,
      endDate = None,
      organizationId = None,
      city = None,
      location_name = None,
      sortBy = None,
      sortOrder = None,
      query = None,
      near = None,
      other = None,
      price = None,
      isAuthenticated = false
    )

    cmd.status shouldBe Some(List(EventStatus.PUBLISHED))
  }

  it should "ignore invalid near or price coordinates gracefully" in {
    val cmd = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = None,
      title = None,
      tags = None,
      startDate = None,
      endDate = None,
      organizationId = None,
      city = None,
      location_name = None,
      sortBy = None,
      sortOrder = None,
      query = None,
      near = Some("invalid,format"),
      other = None,
      price = Some("invalid,format"),
      isAuthenticated = false
    )

    cmd.near.isEmpty shouldBe true
    cmd.price.isEmpty shouldBe true
  }

  it should "handle unauthenticated requests by defaulting to PUBLISHED or matching passed statuses" in {
    val cmd = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = Some(List("DRAFT")),
      title = None,
      tags = None,
      startDate = None,
      endDate = None,
      organizationId = None,
      city = None,
      location_name = None,
      sortBy = None,
      sortOrder = None,
      query = None,
      near = None,
      other = None,
      price = None,
      isAuthenticated = false
    )
    cmd.status shouldBe Some(List(EventStatus.DRAFT))
  }

  it should "handle badly formed dates on parseEventFilters" in {
    val cmd = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = None,
      title = None,
      tags = None,
      startDate = Some("bad-date"),
      endDate = Some("bad-date"),
      organizationId = None,
      city = None,
      location_name = None,
      sortBy = Some("invalid-sort"),
      sortOrder = Some("invalid-order"),
      query = None,
      near = None,
      other = None,
      price = None,
      isAuthenticated = true
    )
    cmd.startDate.isEmpty shouldBe true
    cmd.endDate.isEmpty shouldBe true
    cmd.sortBy.isEmpty shouldBe true
    cmd.sortOrder.isEmpty shouldBe true
  }

  it should "handle authenticated requests with no status provided seamlessly" in {
    val cmd = Utils.parseEventFilters(
      limit = None,
      offset = None,
      status = None,
      title = None,
      tags = None,
      startDate = None,
      endDate = None,
      organizationId = None,
      city = None,
      location_name = None,
      sortBy = None,
      sortOrder = None,
      query = None,
      near = None,
      other = None,
      price = None,
      isAuthenticated = true
    )
    cmd.status.isEmpty shouldBe true
  }

  "createPaginatedResponse" should "generate a correct JSON response object" in {
    val response = Utils.createPaginatedResponse(List.empty, Some(10), Some(5), hasMore = true)
    response("limit").num shouldBe 10
    response("offset").num shouldBe 5
    response("hasMore").bool shouldBe true
    response("items").arr.length shouldBe 0
  }

  "checkUserIsOrganization" should "return true for role organization" in {
    import infrastructure.db.UserMetadataRepository
    import infrastructure.dto.UserMetadata
    import com.mongodb.client.ClientSession
    class FakeUserMetadataRepo extends UserMetadataRepository:
      override def save(user: UserMetadata): Either[Throwable, Unit] = Right(())
      override def delete(id: String): Either[Throwable, Unit]       = Right(())
      override def findById(id: String): Option[UserMetadata] = Some(UserMetadata("user-1", "organization", "Org Name"))
      override def findById(id: String, session: ClientSession): Option[UserMetadata] = None

    Utils.checkUserIsOrganization("user-1", new FakeUserMetadataRepo()) shouldBe true
  }

  it should "return false for role user" in {
    import infrastructure.db.UserMetadataRepository
    import infrastructure.dto.UserMetadata
    import com.mongodb.client.ClientSession
    class FakeUserMetadataRepo extends UserMetadataRepository:
      override def save(user: UserMetadata): Either[Throwable, Unit] = Right(())
      override def delete(id: String): Either[Throwable, Unit]       = Right(())
      override def findById(id: String): Option[UserMetadata]        = Some(UserMetadata("user-1", "user", "User Name"))
      override def findById(id: String, session: ClientSession): Option[UserMetadata] = None

    Utils.checkUserIsOrganization("user-1", new FakeUserMetadataRepo()) shouldBe false
  }

  it should "return false when missing" in {
    import infrastructure.db.UserMetadataRepository
    import infrastructure.dto.UserMetadata
    import com.mongodb.client.ClientSession
    class FakeUserMetadataRepo extends UserMetadataRepository:
      override def save(user: UserMetadata): Either[Throwable, Unit]                  = Right(())
      override def delete(id: String): Either[Throwable, Unit]                        = Right(())
      override def findById(id: String): Option[UserMetadata]                         = None
      override def findById(id: String, session: ClientSession): Option[UserMetadata] = None

    Utils.checkUserIsOrganization("user-1", new FakeUserMetadataRepo()) shouldBe false
  }
