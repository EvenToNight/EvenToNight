package domain.valueobjects

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class OrganizationIdSpec extends AnyFlatSpec with Matchers:

  "OrganizationId.apply" should "create a valid OrganizationId from a non-empty string" in {
    val result = OrganizationId("org-1234")
    result.isRight.shouldBe(true)
    result.map(_.value).shouldBe(Right("org-1234"))
  }

  it should "reject null values" in {
    val result = OrganizationId(null)
    result.shouldBe(Left("OrganizationId cannot be null or empty"))
  }

  it should "reject empty strings" in {
    val result = OrganizationId("")
    result.shouldBe(Left("OrganizationId cannot be null or empty"))
  }

  it should "reject whitespace-only strings" in {
    val result = OrganizationId("   ")
    result.shouldBe(Left("OrganizationId cannot be null or empty"))
  }

  it should "preserve non-empty values as provided" in {
    OrganizationId("  org-with-spaces  ").map(_.value) shouldBe Right("  org-with-spaces  ")
  }

  "OrganizationId.unsafe" should "create an OrganizationId without validation" in {
    val id = OrganizationId.unsafe("any-org-id")
    id.value.shouldBe("any-org-id")
  }

  "OrganizationId extensions" should "provide value and asString methods" in {
    val id = OrganizationId.unsafe("org-xyz")
    id.value.shouldBe("org-xyz")
    id.asString.shouldBe("org-xyz")
  }
