package domain.commands.validators

import infrastructure.dto.Location
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime

class ValidationRulesSpec extends AnyFlatSpec with Matchers:

  "nonEmpty" should "return Right for a non-empty string" in {
    ValidationRules.nonEmpty("hello", "field").isRight shouldBe true
  }

  it should "return Left for an empty string" in {
    ValidationRules.nonEmpty("", "field").isLeft shouldBe true
  }

  it should "return Left for a whitespace-only string" in {
    ValidationRules.nonEmpty("  ", "field").isLeft shouldBe true
  }

  "futureDate" should "return Right for a future date" in {
    ValidationRules.futureDate(LocalDateTime.now().plusDays(1)).isRight shouldBe true
  }

  it should "return Left for a past date" in {
    ValidationRules.futureDate(LocalDateTime.now().minusDays(1)).isLeft shouldBe true
  }

  "correctLocality" should "return Right for a valid location" in {
    val location = Location(
      name = None,
      country = Some("Italy"),
      country_code = Some("IT"),
      state = None,
      province = None,
      city = Some("Rome"),
      road = Some("Via Roma"),
      postcode = Some("00100"),
      house_number = None,
      lat = Some(41.9028),
      lon = Some(12.4964),
      link = None
    )
    ValidationRules.correctLocality(location).isRight shouldBe true
  }

  it should "return Left for a location with invalid latitude" in {
    val location = Location(
      name = None,
      country = Some("Italy"),
      country_code = Some("IT"),
      state = None,
      province = None,
      city = Some("Rome"),
      road = Some("Via Roma"),
      postcode = Some("00100"),
      house_number = None,
      lat = Some(91.0),
      lon = Some(12.4964),
      link = None
    )
    ValidationRules.correctLocality(location).isLeft shouldBe true
  }

  it should "return Left for a location with empty country" in {
    val location = Location(
      name = None,
      country = None,
      country_code = Some("IT"),
      state = None,
      province = None,
      city = Some("Rome"),
      road = Some("Via Roma"),
      postcode = Some("00100"),
      house_number = None,
      lat = Some(41.9028),
      lon = Some(12.4964),
      link = None
    )
    ValidationRules.correctLocality(location).isLeft shouldBe true
  }

  "positiveInt" should "return Right for a positive integer" in {
    ValidationRules.positiveInt(Some(5), "field").isRight shouldBe true
  }

  it should "return Left for zero" in {
    ValidationRules.positiveInt(Some(0), "field").isLeft shouldBe true
  }

  it should "return Left for a negative integer" in {
    ValidationRules.positiveInt(Some(-1), "field").isLeft shouldBe true
  }

  it should "return Right for None" in {
    ValidationRules.positiveInt(None, "field").isRight shouldBe true
  }

  "nonNegativeInt" should "return Right for zero" in {
    ValidationRules.nonNegativeInt(Some(0), "field").isRight shouldBe true
  }

  it should "return Right for a positive integer" in {
    ValidationRules.nonNegativeInt(Some(1), "field").isRight shouldBe true
  }

  it should "return Left for a negative integer" in {
    ValidationRules.nonNegativeInt(Some(-1), "field").isLeft shouldBe true
  }

  "dateRange" should "return Right for a valid date range" in {
    val start = LocalDateTime.now().plusDays(1)
    val end   = LocalDateTime.now().plusDays(7)
    ValidationRules.dateRange(Some(start), Some(end), "Date range").isRight shouldBe true
  }

  it should "return Left when start is after end" in {
    val start = LocalDateTime.now().plusDays(7)
    val end   = LocalDateTime.now().plusDays(1)
    ValidationRules.dateRange(Some(start), Some(end), "Date range").isLeft shouldBe true
  }

  it should "return Right when dates are None" in {
    ValidationRules.dateRange(None, None, "Date range").isRight shouldBe true
  }