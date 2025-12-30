package domain.commands.validators
import domain.models.Location
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class ValidationRulesTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  private def createLocation(
      country: String = "Test Country",
      country_code: Option[String] = Some("TC"),
      road: String = "Test Road",
      postcode: String = "12345",
      house_number: String = "10A",
      lat: Double = 45.0,
      lon: Double = 90.0,
      link: String = "http://example.com/location"
  ): Location =
    Location.create(
      country = Some(country),
      country_code = country_code,
      road = Some(road),
      postcode = Some(postcode),
      house_number = Some(house_number),
      lat = Some(lat),
      lon = Some(lon),
      link = Some(link)
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
    val invalidLocation = createLocation(country_code = None)
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

  "PositiveInt rule" should "validate positive integers successfully" in:
    val result = ValidationRules.positiveInt(Some(5), "Attendees")
    result shouldBe Right(())

  it should "reject zero as non-positive" in:
    val result = ValidationRules.positiveInt(Some(0), "Attendees")
    result shouldBe Left("Attendees must be positive")

  it should "reject negative integers" in:
    val result = ValidationRules.positiveInt(Some(-3), "Attendees")
    result shouldBe Left("Attendees must be positive")

  it should "accept None as valid" in:
    val result = ValidationRules.positiveInt(None, "Attendees")
    result shouldBe Right(())

  "NonNegativeInt rule" should "validate non-negative integers successfully" in:
    val result = ValidationRules.nonNegativeInt(Some(0), "Seats")
    result shouldBe Right(())

  it should "reject negative integers" in:
    val result = ValidationRules.nonNegativeInt(Some(-1), "Seats")
    result shouldBe Left("Seats cannot be negative")

  it should "accept None as valid" in:
    val result = ValidationRules.nonNegativeInt(None, "Seats")
    result shouldBe Right(())

  "DateRange rule" should "validate correct date ranges successfully" in:
    val startDate = Some(LocalDateTime.now().minusDays(1))
    val endDate   = Some(LocalDateTime.now().plusDays(1))
    val result    = ValidationRules.dateRange(startDate, endDate, "Event Dates")
    result shouldBe Right(())

  it should "reject start date after end date" in:
    val startDate = Some(LocalDateTime.now().plusDays(2))
    val endDate   = Some(LocalDateTime.now().plusDays(1))
    val result    = ValidationRules.dateRange(startDate, endDate, "Event Dates")
    result shouldBe Left("Event Dates: start date must be before end date")

  it should "accept when start date is None" in:
    val endDate = Some(LocalDateTime.now().plusDays(1))
    val result  = ValidationRules.dateRange(None, endDate, "Event Dates")
    result shouldBe Right(())

  it should "accept when end date is None" in:
    val startDate = Some(LocalDateTime.now().minusDays(1))
    val result    = ValidationRules.dateRange(startDate, None, "Event Dates")
    result shouldBe Right(())

  it should "accept when both dates are None" in:
    val result = ValidationRules.dateRange(None, None, "Event Dates")
    result shouldBe Right(())

  "PriceRange rule" should "validate correct price ranges successfully" in:
    val result = ValidationRules.priceRange(Some((10.0, 50.0)), "Event Prices")
    result shouldBe Right(())

  it should "reject negative minimum price" in:
    val result = ValidationRules.priceRange(Some((-5.0, 50.0)), "Event Prices")
    result shouldBe Left("Event Prices: prices cannot be negative")

  it should "reject negative maximum price" in:
    val result = ValidationRules.priceRange(Some((10.0, -20.0)), "Event Prices")
    result shouldBe Left("Event Prices: prices cannot be negative")

  it should "reject minimum price greater than maximum price" in:
    val result = ValidationRules.priceRange(Some((60.0, 50.0)), "Event Prices")
    result shouldBe Left("Event Prices: minimum price must be less than or equal to maximum price")

  it should "accept None as valid" in:
    val result = ValidationRules.priceRange(None, "Event Prices")
    result shouldBe Right(())
