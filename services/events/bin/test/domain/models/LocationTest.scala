package domain.models

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.compiletime.uninitialized

class LocationTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var locality: Location = uninitialized

  "Location.Nil()" should "create location with empty/default values" in:
    val nilLocation = Location.Nil()

    nilLocation.name shouldBe None
    nilLocation.country shouldBe None
    nilLocation.country_code shouldBe None
    nilLocation.state shouldBe None
    nilLocation.province shouldBe None
    nilLocation.city shouldBe None
    nilLocation.road shouldBe None
    nilLocation.postcode shouldBe None
    nilLocation.house_number shouldBe None
    nilLocation.lat shouldBe None
    nilLocation.lon shouldBe None
    nilLocation.link shouldBe None

  it should "be equal to manually created empty location" in:
    val nilLocation   = Location.Nil()
    val emptyLocation = Location(None, None, None, None, None, None, None, None, None, None, None, None)

    nilLocation shouldEqual emptyLocation
    nilLocation.hashCode shouldEqual emptyLocation.hashCode

  "Location.create factory method" should "create location with specified parameters" in:
    val createdLocation = Location.create(
      country = Some("Spain"),
      country_code = Some("ES"),
      road = Some("Gran Vía"),
      postcode = Some("28013"),
      house_number = Some("15"),
      lat = Some(40.4168),
      lon = Some(-3.7038),
      link = Some("https://madrid.com")
    )

    createdLocation.country.get shouldBe "Spain"
    createdLocation.country_code.get shouldBe "ES"
    createdLocation.road.get shouldBe "Gran Vía"
    createdLocation.postcode.get shouldBe "28013"
    createdLocation.house_number.get shouldBe "15"
    createdLocation.lat.get shouldBe 40.4168
    createdLocation.lon.get shouldBe -3.7038
    createdLocation.link.get shouldBe "https://madrid.com"
    createdLocation.name shouldBe None
    createdLocation.state shouldBe None
    createdLocation.province shouldBe None
    createdLocation.city shouldBe None

  it should "handle minimum required parameters" in:
    val minimalLocation = Location.create(
      country = Some("Test"),
      country_code = Some("T"),
      road = Some("R"),
      postcode = Some("1"),
      house_number = Some("1"),
      lat = Some(0.0),
      lon = Some(0.0),
      link = Some("")
    )

    minimalLocation.country.get shouldBe "Test"
    minimalLocation.lat.get shouldBe 0.0
    minimalLocation.lon.get shouldBe 0.0

  "Location creation with all fields" should "be instantiated correctly with all fields" in:
    locality = Location.create(
      name = Some("Test Locality"),
      country = Some("Test Country"),
      country_code = Some("TC"),
      state = Some("Test State"),
      province = Some("Test Province"),
      city = Some("Test Town"),
      road = Some("Test Road"),
      postcode = Some("45678"),
      house_number = Some("123"),
      lat = Some(12.34),
      lon = Some(56.78),
      link = Some("http://testlink.com")
    )

    locality.name.get shouldBe "Test Locality"
    locality.lat.get shouldBe 12.34
    locality.lon.get shouldBe 56.78
    locality.country.get shouldBe "Test Country"
    locality.country_code.get shouldBe "TC"
    locality.province.get shouldBe "Test Province"
    locality.road.get shouldBe "Test Road"
    locality.house_number.get shouldBe "123"
    locality.postcode.get shouldBe "45678"
    locality.city.get shouldBe "Test Town"
    locality.state.get shouldBe "Test State"
    locality.link.get shouldBe "http://testlink.com"

  it should "handle missing optional fields gracefully" in:
    locality = Location.create(
      name = Some(""),
      country = Some("CountryOnly"),
      country_code = Some("CO"),
      state = Some(""),
      province = Some(""),
      city = Some(""),
      road = Some(""),
      postcode = Some(""),
      house_number = Some(""),
      lat = Some(0.0),
      lon = Some(0.0),
      link = Some("")
    )
    locality.name.get shouldBe ""
    locality.country.get shouldBe "CountryOnly"
    locality.country_code.get shouldBe "CO"
    locality.state.get shouldBe ""
    locality.province.get shouldBe ""
    locality.city.get shouldBe ""
    locality.road.get shouldBe ""
    locality.postcode.get shouldBe ""
    locality.house_number.get shouldBe ""
    locality.lat.get shouldBe 0.0
    locality.lon.get shouldBe 0.0
    locality.link.get shouldBe ""

  it should "correctly store latitude and longitude values" in:
    val latValue = 45.6789
    val lonValue = 98.7654
    locality = Location.create(
      name = Some("GeoTest"),
      country = Some("GeoCountry"),
      country_code = Some("GC"),
      state = Some("GeoState"),
      province = Some("GeoProvince"),
      city = Some("GeoCity"),
      road = Some("GeoRoad"),
      postcode = Some("GeoPostcode"),
      house_number = Some("GeoHouse"),
      lat = Some(latValue),
      lon = Some(lonValue),
      link = Some("http://geotestlink.com")
    )

    locality.lat.get shouldBe latValue
    locality.lon.get shouldBe lonValue

  it should "allow creation with minimal required fields" in:
    locality = Location.create(
      country = Some("MinCountry"),
      country_code = Some("MC"),
      road = Some("MinRoad"),
      postcode = Some("MinPostcode"),
      house_number = Some("MinHouse"),
      lat = Some(1.23),
      lon = Some(4.56),
      link = Some("http://minlink.com")
    )
    locality.country.get shouldBe "MinCountry"
    locality.country_code.get shouldBe "MC"
    locality.road.get shouldBe "MinRoad"
    locality.postcode.get shouldBe "MinPostcode"
    locality.house_number.get shouldBe "MinHouse"
    locality.lat.get shouldBe 1.23
    locality.lon.get shouldBe 4.56
    locality.link.get shouldBe "http://minlink.com"
    locality.name shouldBe None
    locality.state shouldBe None
    locality.province shouldBe None
    locality.city shouldBe None

  "Locality.Nil (merged test)" should "return a Locality instance with default values" in:
    locality = Location.Nil()
    locality.name shouldBe None
    locality.country shouldBe None
    locality.country_code shouldBe None
    locality.state shouldBe None
    locality.province shouldBe None
    locality.city shouldBe None
    locality.road shouldBe None
    locality.postcode shouldBe None
    locality.house_number shouldBe None
    locality.lat shouldBe None
    locality.lon shouldBe None
    locality.link shouldBe None

  "Location edge cases" should "handle empty string fields" in:
    val emptyLocation = Location(
      name = None,
      country = None,
      country_code = None,
      state = None,
      province = None,
      city = None,
      road = None,
      postcode = None,
      house_number = None,
      lat = None,
      lon = None,
      link = None
    )

    emptyLocation.name shouldBe None
    emptyLocation.country shouldBe None
    emptyLocation.lat shouldBe None
    emptyLocation.lon shouldBe None
