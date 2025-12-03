package domain.models

import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.compiletime.uninitialized

class LocationTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach:

  var locality: Location = uninitialized

  private def createSampleLocation(): Location =
    Location(
      name = "Sample Location",
      country = "Italy",
      country_code = "IT",
      state = "Lombardy",
      province = "Milan",
      city = "Milano",
      road = "Via Roma",
      postcode = "20100",
      house_number = "1",
      lat = 45.4642,
      lon = 9.1900,
      link = "https://example.com"
    )

  "Location copy methods" should "copy with single parameter changes" in:
    val original = createSampleLocation()

    val copiedName = original.copy(name = "New Name")
    copiedName.name shouldBe "New Name"
    copiedName.country shouldBe original.country
    copiedName.lat shouldBe original.lat

    val copiedCountry = original.copy(country = "France")
    copiedCountry.country shouldBe "France"
    copiedCountry.name shouldBe original.name

    val copiedLat = original.copy(lat = 48.8566)
    copiedLat.lat shouldBe 48.8566
    copiedLat.lon shouldBe original.lon

  it should "copy with multiple parameter changes" in:
    val original = createSampleLocation()

    val multiCopy = original.copy(
      name = "Paris Location",
      country = "France",
      country_code = "FR",
      lat = 48.8566,
      lon = 2.3522
    )

    multiCopy.name shouldBe "Paris Location"
    multiCopy.country shouldBe "France"
    multiCopy.country_code shouldBe "FR"
    multiCopy.lat shouldBe 48.8566
    multiCopy.lon shouldBe 2.3522
    // Unchanged fields
    multiCopy.state shouldBe original.state
    multiCopy.city shouldBe original.city

  it should "copy all possible field combinations" in:
    val original = createSampleLocation()

    val allFieldsCopy = original.copy(
      name = "Complete Copy",
      country = "Germany",
      country_code = "DE",
      state = "Bavaria",
      province = "Munich",
      city = "München",
      road = "Marienplatz",
      postcode = "80331",
      house_number = "2",
      lat = 48.1351,
      lon = 11.5820,
      link = "https://munich.de"
    )

    allFieldsCopy.name shouldBe "Complete Copy"
    allFieldsCopy.country shouldBe "Germany"
    allFieldsCopy.country_code shouldBe "DE"
    allFieldsCopy.state shouldBe "Bavaria"
    allFieldsCopy.province shouldBe "Munich"
    allFieldsCopy.city shouldBe "München"
    allFieldsCopy.road shouldBe "Marienplatz"
    allFieldsCopy.postcode shouldBe "80331"
    allFieldsCopy.house_number shouldBe "2"
    allFieldsCopy.lat shouldBe 48.1351
    allFieldsCopy.lon shouldBe 11.5820
    allFieldsCopy.link shouldBe "https://munich.de"

  "Location equals and hashCode" should "be equal when all fields match" in:
    val location1 = createSampleLocation()
    val location2 = createSampleLocation()

    location1 shouldEqual location2
    location1.hashCode shouldEqual location2.hashCode

  it should "not be equal when fields differ" in:
    val location1 = createSampleLocation()
    val location2 = location1.copy(name = "Different Name")

    location1 should not equal location2
    location1.hashCode should not equal location2.hashCode

  it should "not be equal when coordinates differ" in:
    val location1 = createSampleLocation()
    val location2 = location1.copy(lat = 40.7128, lon = -74.0060)

    location1 should not equal location2
    location1.hashCode should not equal location2.hashCode

  it should "handle equality with different object types" in:
    val location = createSampleLocation()

    location should not equal "not a location"
    location should not equal 123
    location should not equal null

  it should "satisfy equals contract - reflexive" in:
    val location = createSampleLocation()
    location shouldEqual location

  it should "satisfy equals contract - symmetric" in:
    val location1 = createSampleLocation()
    val location2 = createSampleLocation()

    (location1 == location2) shouldBe (location2 == location1)

  it should "satisfy equals contract - transitive" in:
    val location1 = createSampleLocation()
    val location2 = createSampleLocation()
    val location3 = createSampleLocation()

    location1 shouldEqual location2
    location2 shouldEqual location3
    location1 shouldEqual location3

  "Location edge cases" should "handle empty string fields" in:
    val emptyLocation = Location(
      name = "",
      country = "",
      country_code = "",
      state = "",
      province = "",
      city = "",
      road = "",
      postcode = "",
      house_number = "",
      lat = 0.0,
      lon = 0.0,
      link = ""
    )

    emptyLocation.name shouldBe ""
    emptyLocation.country shouldBe ""
    emptyLocation.lat shouldBe 0.0
    emptyLocation.lon shouldBe 0.0

  it should "handle extreme coordinate values" in:
    val northPole    = createSampleLocation().copy(lat = 90.0, lon = 0.0)
    val southPole    = createSampleLocation().copy(lat = -90.0, lon = 0.0)
    val dateLineWest = createSampleLocation().copy(lat = 0.0, lon = 180.0)
    val dateLineEast = createSampleLocation().copy(lat = 0.0, lon = -180.0)

    northPole.lat shouldBe 90.0
    southPole.lat shouldBe -90.0
    dateLineWest.lon shouldBe 180.0
    dateLineEast.lon shouldBe -180.0

  it should "handle very long string fields" in:
    val longString = "A" * 1000
    val longLocation = createSampleLocation().copy(
      name = longString,
      road = longString,
      link = s"https://example.com/$longString"
    )

    longLocation.name should have length 1000
    longLocation.road should have length 1000
    longLocation.link should startWith("https://example.com/")

  it should "handle special characters in fields" in:
    val specialLocation = createSampleLocation().copy(
      name = "Café & Restaurant",
      road = "Straße mit Ümlaüten",
      city = "São Paulo",
      link = "https://example.com/path?param=value&other=ñoño"
    )

    specialLocation.name shouldBe "Café & Restaurant"
    specialLocation.road shouldBe "Straße mit Ümlaüten"
    specialLocation.city shouldBe "São Paulo"
    specialLocation.link should include("ñoño")

  it should "handle numeric edge cases in coordinates" in:
    val preciseLocation = createSampleLocation().copy(
      lat = 45.123456789,
      lon = 9.987654321
    )

    preciseLocation.lat shouldBe 45.123456789
    preciseLocation.lon shouldBe 9.987654321

  "Location.Nil()" should "create location with empty/default values" in:
    val nilLocation = Location.Nil()

    nilLocation.name shouldBe ""
    nilLocation.country shouldBe ""
    nilLocation.country_code shouldBe ""
    nilLocation.state shouldBe ""
    nilLocation.province shouldBe ""
    nilLocation.city shouldBe ""
    nilLocation.road shouldBe ""
    nilLocation.postcode shouldBe ""
    nilLocation.house_number shouldBe ""
    nilLocation.lat shouldBe 0.0
    nilLocation.lon shouldBe 0.0
    nilLocation.link shouldBe ""

  it should "be equal to manually created empty location" in:
    val nilLocation   = Location.Nil()
    val emptyLocation = Location("", "", "", "", "", "", "", "", "", 0.0, 0.0, "")

    nilLocation shouldEqual emptyLocation
    nilLocation.hashCode shouldEqual emptyLocation.hashCode

  "Location.create factory method" should "create location with specified parameters" in:
    val createdLocation = Location.create(
      country = "Spain",
      country_code = "ES",
      road = "Gran Vía",
      postcode = "28013",
      house_number = "15",
      lat = 40.4168,
      lon = -3.7038,
      link = "https://madrid.com"
    )

    createdLocation.country shouldBe "Spain"
    createdLocation.country_code shouldBe "ES"
    createdLocation.road shouldBe "Gran Vía"
    createdLocation.postcode shouldBe "28013"
    createdLocation.house_number shouldBe "15"
    createdLocation.lat shouldBe 40.4168
    createdLocation.lon shouldBe -3.7038
    createdLocation.link shouldBe "https://madrid.com"
    createdLocation.name shouldBe ""
    createdLocation.state shouldBe ""
    createdLocation.province shouldBe ""
    createdLocation.city shouldBe ""

  it should "handle minimum required parameters" in:
    val minimalLocation = Location.create(
      country = "Test",
      country_code = "T",
      road = "R",
      postcode = "1",
      house_number = "1",
      lat = 0.0,
      lon = 0.0,
      link = ""
    )

    minimalLocation.country shouldBe "Test"
    minimalLocation.lat shouldBe 0.0
    minimalLocation.lon shouldBe 0.0

  "Locality (Location) creation with all fields" should "be instantiated correctly with all fields" in:
    locality = Location.create(
      name = "Test Locality",
      country = "Test Country",
      country_code = "TC",
      state = "Test State",
      province = "Test Province",
      city = "Test Town",
      road = "Test Road",
      postcode = "45678",
      house_number = "123",
      lat = 12.34,
      lon = 56.78,
      link = "http://testlink.com"
    )

    locality.name shouldBe "Test Locality"
    locality.lat shouldBe 12.34
    locality.lon shouldBe 56.78
    locality.country shouldBe "Test Country"
    locality.country_code shouldBe "TC"
    locality.province shouldBe "Test Province"
    locality.road shouldBe "Test Road"
    locality.house_number shouldBe "123"
    locality.postcode shouldBe "45678"
    locality.city shouldBe "Test Town"
    locality.state shouldBe "Test State"
    locality.link shouldBe "http://testlink.com"

  it should "handle missing optional fields gracefully" in:
    locality = Location.create(
      name = "",
      country = "CountryOnly",
      country_code = "CO",
      state = "",
      province = "",
      city = "",
      road = "",
      postcode = "",
      house_number = "",
      lat = 0.0,
      lon = 0.0,
      link = ""
    )
    locality.name shouldBe ""
    locality.country shouldBe "CountryOnly"
    locality.country_code shouldBe "CO"
    locality.state shouldBe ""
    locality.province shouldBe ""
    locality.city shouldBe ""
    locality.road shouldBe ""
    locality.postcode shouldBe ""
    locality.house_number shouldBe ""
    locality.lat shouldBe 0.0
    locality.lon shouldBe 0.0
    locality.link shouldBe ""

  it should "correctly store latitude and longitude values" in:
    val latValue = 45.6789
    val lonValue = 98.7654
    locality = Location.create(
      name = "GeoTest",
      country = "GeoCountry",
      country_code = "GC",
      state = "GeoState",
      province = "GeoProvince",
      city = "GeoCity",
      road = "GeoRoad",
      postcode = "GeoPostcode",
      house_number = "GeoHouse",
      lat = latValue,
      lon = lonValue,
      link = "http://geotestlink.com"
    )

    locality.lat shouldBe latValue
    locality.lon shouldBe lonValue

  it should "allow creation with minimal required fields" in:
    locality = Location.create(
      country = "MinCountry",
      country_code = "MC",
      road = "MinRoad",
      postcode = "MinPostcode",
      house_number = "MinHouse",
      lat = 1.23,
      lon = 4.56,
      link = "http://minlink.com"
    )
    locality.country shouldBe "MinCountry"
    locality.country_code shouldBe "MC"
    locality.road shouldBe "MinRoad"
    locality.postcode shouldBe "MinPostcode"
    locality.house_number shouldBe "MinHouse"
    locality.lat shouldBe 1.23
    locality.lon shouldBe 4.56
    locality.link shouldBe "http://minlink.com"
    locality.name shouldBe ""
    locality.state shouldBe ""
    locality.province shouldBe ""
    locality.city shouldBe ""

  "Locality.Nil (merged test)" should "return a Locality instance with default values" in:
    locality = Location.Nil()
    locality.name shouldBe ""
    locality.country shouldBe ""
    locality.country_code shouldBe ""
    locality.state shouldBe ""
    locality.province shouldBe ""
    locality.city shouldBe ""
    locality.road shouldBe ""
    locality.postcode shouldBe ""
    locality.house_number shouldBe ""
    locality.lat shouldBe 0.0
    locality.lon shouldBe 0.0
    locality.link shouldBe ""
