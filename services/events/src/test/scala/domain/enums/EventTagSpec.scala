package domain.enums

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventTagSpec extends AnyFlatSpec with Matchers:

  "EventTag lists" should "contain values for all categories" in {
    EventTag.EventTypes should contain("Live Music")
    EventTag.Venues should contain("Club")
    EventTag.MusicStyles should contain("Electronic")
    EventTag.Specials should contain("Halloween")
    EventTag.Targets should contain("Students")
    EventTag.Extras should contain("Dress Code")
  }

  "EventTag.fromString" should "parse valid tags ignoring case" in {
    EventTag.fromString("live MUSIC") shouldBe EventTag.EventType.LiveMusic
    EventTag.fromString("club") shouldBe EventTag.Venue.Club
    EventTag.fromString("ELECTRONIC") shouldBe EventTag.MusicStyle.Electronic
    EventTag.fromString("Private Event") shouldBe EventTag.Special.PrivateEvent
    EventTag.fromString("over 30") shouldBe EventTag.Target.Over30
    EventTag.fromString("white Party") shouldBe EventTag.Extra.WhiteParty
  }

  it should "return an InvalidTag for unknown strings" in {
    val invalid = EventTag.fromString("Unknown Tag")
    invalid.isInstanceOf[EventTag.InvalidTag] shouldBe true
    invalid.displayName shouldBe "Invalid Tag"
  }

  "EventTag.validateTagList" should "parse a JSON array formatted string" in {
    val jsonString = """["Live Music", "Club"]"""
    val result = EventTag.validateTagList(jsonString)
    result.isDefined shouldBe true
    result.get shouldBe List(EventTag.EventType.LiveMusic, EventTag.Venue.Club)
  }

  it should "parse a comma-separated string" in {
    val csvString = "Concert, Rock, invalid_tag"
    val result = EventTag.validateTagList(csvString)
    result.isDefined shouldBe true
    result.get shouldBe List(EventTag.EventType.Concert, EventTag.MusicStyle.Rock)
  }

  it should "return None if no valid tags are found" in {
    val csvString = "invalid1, invalid2"
    val result = EventTag.validateTagList(csvString)
    result.isEmpty shouldBe true
  }

  it should "return None if string is empty or spaces" in {
    EventTag.validateTagList("   ").isEmpty shouldBe true
  }
