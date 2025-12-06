package domain.commands.validators
import domain.models.Location
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class ValidationRulesTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private def createLocation(
      country: String = "Test Country",
      country_code: String = "TC",
      road: String = "Test Road",
      postcode: String = "12345",
      house_number: String = "10A",
      lat: Double = 45.0,
      lon: Double = 90.0,
      link: String = "http://example.com/location"
  ): Location =
    Location.create(
      country = country,
      country_code = country_code,
      road = road,
      postcode = postcode,
      house_number = house_number,
      lat = lat,
      lon = lon,
      link = link
    )

  "NonEmpty rule" should "validate non-empty strings successfully" in:
    val result = ValidationRules.nonEmpty("Valid String", "Test Field")
    result shouldBe Right("Valid String")

  it should "reject empty strings" in:
    val result = ValidationRules.nonEmpty("", "Test Field")
    result shouldBe Left("Test Field cannot be empty")

  it should "reject strings with only whitespace" in:
    val result = ValidationRules.nonEmpty("   ", "Test Field")
    result shouldBe Left("Test Field cannot be empty")

  "FutureDate rule" should "validate future dates successfully" in:
    val futureDate = LocalDateTime.now().plusDays(1)
    val result     = ValidationRules.futureDate(futureDate, "Event Date")
    result shouldBe Right(futureDate)

  it should "reject past dates" in:
    val pastDate = LocalDateTime.now().minusDays(1)
    val result   = ValidationRules.futureDate(pastDate, "Event Date")
    result shouldBe Left("Event Date must be in the future")

  it should "reject current date/time" in:
    val currentDate = LocalDateTime.now()
    val result      = ValidationRules.futureDate(currentDate, "Event Date")
    result shouldBe Left("Event Date must be in the future")

  "CorrectLocality rule" should "validate correct locality successfully" in:
    val validLocation = createLocation()
    val result        = ValidationRules.correctLocality(validLocation, "Event Location")
    result shouldBe Right(validLocation)
  it should "reject locality with invalid latitude" in:
    val invalidLocation = createLocation(lat = 100.0)
    val result          = ValidationRules.correctLocality(invalidLocation, "Event Location")
    result shouldBe Left("Event Location has invalid parameters")
  it should "reject locality with invalid longitude" in:
    val invalidLocation = createLocation(lon = 200.0)
    val result          = ValidationRules.correctLocality(invalidLocation, "Event Location")
    result shouldBe Left("Event Location has invalid parameters")
  it should "reject locality with empty country" in:
    val invalidLocation = createLocation(country = "")
    val result          = ValidationRules.correctLocality(invalidLocation, "Event Location")
    result shouldBe Left("Event Location has invalid parameters")
  it should "reject locality with empty country code" in:
    val invalidLocation = createLocation(country_code = "")
    val result          = ValidationRules.correctLocality(invalidLocation, "Event Location")
    result shouldBe Left("Event Location has invalid parameters")
  it should "reject locality with empty road" in:
    val invalidLocation = createLocation(road = "")
    val result          = ValidationRules.correctLocality(invalidLocation, "Event Location")
    result shouldBe Left("Event Location has invalid parameters")
  it should "reject locality with empty postcode" in:
    val invalidLocation = createLocation(postcode = "")
    val result          = ValidationRules.correctLocality(invalidLocation, "Event Location")
    result shouldBe Left("Event Location has invalid parameters")
