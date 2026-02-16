package domain.valueobjects

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class LocationSpec extends AnyFlatSpec with Matchers:

  "Location.apply" should "create a valid Location with name" in {
    val result = Location(name = Some("Teatro Ariston"))
    result.isRight shouldBe true
    result.map(_.displayName) shouldBe Right("Teatro Ariston")
  }

  it should "create a valid Location with city" in {
    val result = Location(city = Some("Milano"))
    result.isRight shouldBe true
    result.map(_.displayName) shouldBe Right("Milano")
  }

  it should "prefer name over city in displayName" in {
    val result = Location(name = Some("Duomo"), city = Some("Milano"))
    result.isRight shouldBe true
    result.map(_.displayName) shouldBe Right("Duomo")
  }

  it should "reject Location without name and city" in {
    val result = Location(country = Some("Italy"))
    result shouldBe Left("Location must have at least a name or a city")
  }

  it should "create Location with coordinates" in {
    val result = Location(
      name = Some("Event Hall"),
      lat = Some(45.4642),
      lon = Some(9.1900)
    )
    result.isRight shouldBe true
    result.map(_.hasCoordinates) shouldBe Right(true)
    result.map(_.latLon) shouldBe Right(Some((45.4642, 9.1900)))
  }

  it should "normalize countryCode to uppercase" in {
    val result = Location(
      name = Some("Venue"),
      countryCode = Some("it")
    )
    result.isRight shouldBe true
    result.map(_.countryCode) shouldBe Right(Some("IT"))
  }

  it should "trim whitespace from fields" in {
    val result = Location(
      name = Some("  Teatro  "),
      city = Some("  Roma  ")
    )
    result.isRight shouldBe true
    result.map(_.name) shouldBe Right(Some("Teatro"))
    result.map(_.city) shouldBe Right(Some("Roma"))
  }

  it should "filter out empty strings after trimming" in {
    val result = Location(
      name = Some("Venue"),
      state = Some("   ")
    )
    result.isRight shouldBe true
    result.map(_.state) shouldBe Right(None)
  }

  "Location.unsafe" should "create Location without validation" in {
    val location = Location.unsafe(
      name = None,
      country = None,
      countryCode = None,
      state = None,
      province = None,
      city = Some("Test"),
      road = None,
      postcode = None,
      houseNumber = None,
      lat = None,
      lon = None,
      link = None
    )
    location.displayName shouldBe "Test"
  }

  "Coordinates" should "validate latitude range" in {
    Coordinates(-90.0, 0.0).isRight shouldBe true
    Coordinates(90.0, 0.0).isRight shouldBe true
    Coordinates(-91.0, 0.0).isLeft shouldBe true
    Coordinates(91.0, 0.0).isLeft shouldBe true
  }

  it should "validate longitude range" in {
    Coordinates(0.0, -180.0).isRight shouldBe true
    Coordinates(0.0, 180.0).isRight shouldBe true
    Coordinates(0.0, -181.0).isLeft shouldBe true
    Coordinates(0.0, 181.0).isLeft shouldBe true
  }
