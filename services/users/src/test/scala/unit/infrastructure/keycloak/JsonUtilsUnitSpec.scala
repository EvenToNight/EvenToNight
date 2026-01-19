package unit.infrastructure.keycloak

import infrastructure.keycloak.JsonUtils.parseJson
import io.circe.Json
import io.circe.literal._
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class JsonUtilsUnitSpec extends AnyFlatSpec with Matchers:
  "parseJson" should "return Right(json) for valid JSON" in:
    val result = parseJson("""{"some_field": "some_value"}""")
    result shouldBe Right(json"""{"some_field": "some_value"}""")

  it should "return Left for invalid JSON" in:
    val result = parseJson("")
    result.left.value should include("Invalid JSON")

  it should "return Left for malformed JSON" in:
    val result = parseJson("""{"some_field": "some_value""")
    result.left.value should include("Invalid JSON")
