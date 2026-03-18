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

  it should "match enum values count for every category" in {
    EventTag.EventTypes.size.shouldBe(EventTag.EventType.values.length)
    EventTag.Venues.size.shouldBe(EventTag.Venue.values.length)
    EventTag.MusicStyles.size.shouldBe(EventTag.MusicStyle.values.length)
    EventTag.Specials.size.shouldBe(EventTag.Special.values.length)
    EventTag.Targets.size.shouldBe(EventTag.Target.values.length)
    EventTag.Extras.size.shouldBe(EventTag.Extra.values.length)
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

  it should "roundtrip all enum display names" in {
    EventTag.EventType.values.foreach { value =>
      EventTag.fromString(value.displayName).shouldBe(value)
    }
    EventTag.Venue.values.foreach { value =>
      EventTag.fromString(value.displayName).shouldBe(value)
    }
    EventTag.MusicStyle.values.foreach { value =>
      EventTag.fromString(value.displayName).shouldBe(value)
    }
    EventTag.Special.values.foreach { value =>
      EventTag.fromString(value.displayName).shouldBe(value)
    }
    EventTag.Target.values.foreach { value =>
      EventTag.fromString(value.displayName).shouldBe(value)
    }
    EventTag.Extra.values.foreach { value =>
      EventTag.fromString(value.displayName).shouldBe(value)
    }
  }

  "EventTag.validateTagList" should "parse a JSON array formatted string" in {
    val jsonString = """["Live Music", "Club"]"""
    val result     = EventTag.validateTagList(jsonString)
    result.isDefined shouldBe true
    result.get shouldBe List(EventTag.EventType.LiveMusic, EventTag.Venue.Club)
  }

  it should "parse a comma-separated string" in {
    val csvString = "Concert, Rock, invalid_tag"
    val result    = EventTag.validateTagList(csvString)
    result.isDefined shouldBe true
    result.get shouldBe List(EventTag.EventType.Concert, EventTag.MusicStyle.Rock)
  }

  it should "return None if no valid tags are found" in {
    val csvString = "invalid1, invalid2"
    val result    = EventTag.validateTagList(csvString)
    result.isEmpty shouldBe true
  }

  it should "return None if string is empty or spaces" in {
    EventTag.validateTagList("   ").isEmpty shouldBe true
  }

  it should "trim comma-separated values before parsing" in {
    val csvString = "  Live Music  ,   Club  "
    EventTag.validateTagList(csvString) shouldBe Some(List(EventTag.EventType.LiveMusic, EventTag.Venue.Club))
  }
