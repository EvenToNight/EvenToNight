package domain.commands.validators
import infrastructure.dto.Location

import java.time.LocalDateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ValidationRulesSpec extends AnyFlatSpec with Matchers:

  "nonEmpty" should "return Right for a non-empty string" in {
    ValidationRules.nonEmpty("hello", "Field") shouldBe Right("hello")
  }

  it should "return Left for an empty or blank string" in {
    ValidationRules.nonEmpty("", "Field").isLeft shouldBe true
    ValidationRules.nonEmpty("   ", "Field").isLeft shouldBe true
  }

  "futureDate" should "return Right for a future date" in {
    val future = LocalDateTime.now().plusDays(1)
    ValidationRules.futureDate(future) shouldBe Right(future)
  }

  it should "return Left for a past date" in {
    val past = LocalDateTime.now().minusDays(1)
    ValidationRules.futureDate(past).isLeft shouldBe true
  }

  "correctLocality" should "return Right for a valid location" in {
    val validLoc = Location(
      country = Some("Italy"),
      country_code = Some("IT"),
      road = Some("Via Roma"),
      postcode = Some("00100"),
      lat = Some(41.9),
      lon = Some(12.5),
      name = None, state = None, province = None, city = None, house_number = None, link = None
    )
    ValidationRules.correctLocality(validLoc) shouldBe Right(validLoc)
  }

  it should "return Left if latitude is out of bounds" in {
    val invalidLoc = Location(country = Some("Italy"), country_code = Some("IT"), road = Some("R"), postcode = Some("0"), lat = Some(100.0), lon = Some(0.0), name = None, state = None, province = None, city = None, house_number = None, link = None)
    ValidationRules.correctLocality(invalidLoc).isLeft shouldBe true
  }

  it should "return Left if required fields are missing" in {
    val invalidLoc = Location(country = None, country_code = Some("IT"), road = Some("R"), postcode = Some("0"), lat = Some(0.0), lon = Some(0.0), name = None, state = None, province = None, city = None, house_number = None, link = None)
    ValidationRules.correctLocality(invalidLoc).isLeft shouldBe true
  }

  "positiveInt" should "return Right for positive value" in {
    ValidationRules.positiveInt(Some(10), "Limit") shouldBe Right(())
    ValidationRules.positiveInt(None, "Limit") shouldBe Right(())
  }

  it should "return Left for zero or negative value" in {
    ValidationRules.positiveInt(Some(0), "Limit").isLeft shouldBe true
    ValidationRules.positiveInt(Some(-1), "Limit").isLeft shouldBe true
  }

  "nonNegativeInt" should "return Right for zero or positive value" in {
    ValidationRules.nonNegativeInt(Some(0), "Offset") shouldBe Right(())
    ValidationRules.nonNegativeInt(Some(10), "Offset") shouldBe Right(())
    ValidationRules.nonNegativeInt(None, "Offset") shouldBe Right(())
  }

  it should "return Left for negative value" in {
    ValidationRules.nonNegativeInt(Some(-1), "Offset").isLeft shouldBe true
  }

  "dateRange" should "return Right if start is before end" in {
    val start = LocalDateTime.now()
    val end = start.plusDays(1)
    ValidationRules.dateRange(Some(start), Some(end), "Range") shouldBe Right(())
  }

  it should "return Left if start is after end" in {
    val start = LocalDateTime.now().plusDays(1)
    val end = LocalDateTime.now()
    ValidationRules.dateRange(Some(start), Some(end), "Range").isLeft shouldBe true
  }

  it should "return Right if one or both dates are missing" in {
    ValidationRules.dateRange(Some(LocalDateTime.now()), None, "Range") shouldBe Right(())
    ValidationRules.dateRange(None, Some(LocalDateTime.now()), "Range") shouldBe Right(())
    ValidationRules.dateRange(None, None, "Range") shouldBe Right(())
  }
