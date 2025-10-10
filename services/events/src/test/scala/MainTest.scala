import org.scalatest.flatspec.AnyFlatSpec

class MainTest extends AnyFlatSpec {
  "basic" should "run a trivial assertion" in {
    assert(1 + 1 == 2)
  }
}
