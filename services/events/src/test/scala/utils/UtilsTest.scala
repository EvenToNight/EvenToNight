package utils

import cask.model.FormFile
import domain.models.Location
import io.undertow.util.HeaderMap
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.nio.file.Files
import java.nio.file.Paths

class UtilsTest extends AnyFlatSpec with Matchers:

  "Utils.parseLocationFromJson" should "parse valid complete JSON location" in:
    val validJson = """{
      "name": "La Scala",
      "country": "Italy",
      "country_code": "IT",
      "state": "Lombardy",
      "province": "Milan",
      "city": "Milano",
      "road": "Via della Scala",
      "postcode": "20121",
      "house_number": "3",
      "lat": 45.4654,
      "lon": 9.1859,
      "link": "https://www.teatroallascala.org"
    }"""

    val location = Utils.parseLocationFromJson(validJson)

    location.name shouldBe "La Scala"
    location.country shouldBe "Italy"
    location.country_code shouldBe "IT"
    location.state shouldBe "Lombardy"
    location.province shouldBe "Milan"
    location.city shouldBe "Milano"
    location.road shouldBe "Via della Scala"
    location.postcode shouldBe "20121"
    location.house_number shouldBe "3"
    location.lat shouldBe 45.4654
    location.lon shouldBe 9.1859
    location.link shouldBe "https://www.teatroallascala.org"

  it should "parse JSON with missing fields using defaults" in:
    val partialJson = """{
      "country": "Spain",
      "lat": 40.4168,
      "lon": -3.7038
    }"""

    val location = Utils.parseLocationFromJson(partialJson)

    location.country shouldBe "Spain"
    location.lat shouldBe 40.4168
    location.lon shouldBe -3.7038
    location.name shouldBe ""
    location.city shouldBe ""
    location.postcode shouldBe ""

  it should "handle empty JSON object" in:
    val emptyJson = "{}"

    val location = Utils.parseLocationFromJson(emptyJson)

    location.name shouldBe ""
    location.country shouldBe ""
    location.lat shouldBe 0.0
    location.lon shouldBe 0.0

  it should "handle invalid JSON and return Location.Nil()" in:
    val invalidJson = "{ invalid json structure"

    val location = Utils.parseLocationFromJson(invalidJson)

    location shouldBe Location.Nil()

  it should "handle non-JSON string and return Location.Nil()" in:
    val notJson = "this is not json at all"

    val location = Utils.parseLocationFromJson(notJson)

    location shouldBe Location.Nil()

  it should "handle empty string and return Location.Nil()" in:
    val location = Utils.parseLocationFromJson("")

    location shouldBe Location.Nil()

  "Utils.uploadPosterToMediaService" should "return default URL when FormFile has no filePath" in:
    val id_event            = "test-event-123"
    val formFileWithoutPath = FormFile("test.jpg", None, new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithoutPath, "http://media-service")

    result shouldBe "/events/test-event-123/default.jpg"

  it should "return default URL when file cannot be read" in:
    val id_event            = "test-event-456"
    val nonExistentPath     = Paths.get("/non/existent/file.jpg")
    val formFileWithBadPath = FormFile("test.jpg", Some(nonExistentPath), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithBadPath, "http://media-service")

    result shouldBe "/events/test-event-456/default.jpg"

  it should "return default URL when media service request fails" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-789"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val invalidMediaServiceUrl = "http://non-existent-service:9999"

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithValidPath, invalidMediaServiceUrl)

    result shouldBe "/events/test-event-789/default.jpg"

  it should "handle successful upload simulation" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-success"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithValidPath, "http://localhost:8080")

    result shouldBe "/events/test-event-success/default.jpg"

  it should "handle malformed media service response" in:
    val tempFile = Files.createTempFile("test-poster", ".jpg")
    Files.write(tempFile, "test image data".getBytes)

    val id_event              = "test-event-malformed"
    val formFileWithValidPath = FormFile("test.jpg", Some(tempFile), new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithValidPath, "http://httpbin.org/status/500")

    result shouldBe "/events/test-event-malformed/default.jpg"

  it should "generate correct default URL format" in:
    val id_event            = "special-event-#123"
    val formFileWithoutPath = FormFile("test.jpg", None, new HeaderMap())

    val result = Utils.uploadPosterToMediaService(id_event, formFileWithoutPath, "http://media-service")

    result shouldBe "/events/special-event-#123/default.jpg"
