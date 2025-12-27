package domain.models

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventTagTest extends AnyFlatSpec with Matchers:

  "EventType enum" should "have correct display names" in:
    EventTag.EventType.LiveMusic.displayName shouldBe "Live Music"
    EventTag.EventType.Concert.displayName shouldBe "Concert"
    EventTag.EventType.DJSet.displayName shouldBe "DJ Set"
    EventTag.EventType.Party.displayName shouldBe "Party"
    EventTag.EventType.Dinner.displayName shouldBe "Dinner"
    EventTag.EventType.Karaoke.displayName shouldBe "Karaoke"
    EventTag.EventType.Show.displayName shouldBe "Show"

  it should "extend EventTag" in:
    EventTag.EventType.Party shouldBe an[EventTag]
    EventTag.EventType.Concert shouldBe an[EventTag]

  "Venue enum" should "have correct display names" in:
    EventTag.Venue.Club.displayName shouldBe "Club"
    EventTag.Venue.Pub.displayName shouldBe "Pub"
    EventTag.Venue.Bar.displayName shouldBe "Bar"
    EventTag.Venue.Restaurant.displayName shouldBe "Restaurant"
    EventTag.Venue.Theatre.displayName shouldBe "Theatre"
    EventTag.Venue.Outdoor.displayName shouldBe "Outdoor"

  it should "extend EventTag" in:
    EventTag.Venue.Club shouldBe an[EventTag]
    EventTag.Venue.Bar shouldBe an[EventTag]

  "MusicStyle enum" should "have correct display names" in:
    EventTag.MusicStyle.Electronic.displayName shouldBe "Electronic"
    EventTag.MusicStyle.Pop.displayName shouldBe "Pop"
    EventTag.MusicStyle.HipHop.displayName shouldBe "Hip Hop"
    EventTag.MusicStyle.Rock.displayName shouldBe "Rock"
    EventTag.MusicStyle.Reggaeton.displayName shouldBe "Reggaeton"
    EventTag.MusicStyle.Commercial.displayName shouldBe "Commercial"

  it should "extend EventTag" in:
    EventTag.MusicStyle.Rock shouldBe an[EventTag]

  "Special enum" should "have correct display names" in:
    EventTag.Special.Halloween.displayName shouldBe "Halloween"
    EventTag.Special.Christmas.displayName shouldBe "Christmas"
    EventTag.Special.NewYear.displayName shouldBe "New Year"
    EventTag.Special.Carnival.displayName shouldBe "Carnival"
    EventTag.Special.PrivateEvent.displayName shouldBe "Private Event"

  it should "extend EventTag" in:
    EventTag.Special.Halloween shouldBe an[EventTag]

  "Target enum" should "have correct display names" in:
    EventTag.Target.Students.displayName shouldBe "Students"
    EventTag.Target.Over18.displayName shouldBe "Over 18"
    EventTag.Target.Over30.displayName shouldBe "Over 30"
    EventTag.Target.FamilyFriendly.displayName shouldBe "Family Friendly"

  it should "extend EventTag" in:
    EventTag.Target.Students shouldBe an[EventTag]

  "Extra enum" should "have correct display names" in:
    EventTag.Extra.DressCode.displayName shouldBe "Dress Code"
    EventTag.Extra.WhiteParty.displayName shouldBe "White Party"
    EventTag.Extra.BlackParty.displayName shouldBe "Black Party"
    EventTag.Extra.FreeEntry.displayName shouldBe "Free Entry"
    EventTag.Extra.ReservationsRequired.displayName shouldBe "Reservations Required"

  it should "extend EventTag" in:
    EventTag.Extra.DressCode shouldBe an[EventTag]

  "EventTypes list" should "contain all EventType display names" in:
    EventTag.EventTypes should have size 7
    EventTag.EventTypes should contain allOf (
      "Party",
      "Live Music",
      "Concert",
      "DJ Set",
      "Karaoke",
      "Dinner",
      "Show"
    )

  "Venues list" should "contain all Venue display names" in:
    EventTag.Venues should have size 6
    EventTag.Venues should contain allOf (
      "Club",
      "Pub",
      "Bar",
      "Restaurant",
      "Theatre",
      "Outdoor"
    )

  "MusicStyles list" should "contain all MusicStyles display names" in:
    EventTag.MusicStyles should have size 6
    EventTag.MusicStyles should contain allOf (
      "Electronic",
      "Commercial",
      "Reggaeton",
      "Hip Hop",
      "Rock",
      "Pop"
    )

  "Special list" should "contain all Special display names" in:
    EventTag.Specials should have size 5
    EventTag.Specials should contain allOf (
      "Halloween",
      "Christmas",
      "New Year",
      "Carnival",
      "Private Event"
    )

  "Targets list" should "contain all Target display names" in:
    EventTag.Targets should have size 4
    EventTag.Targets should contain allOf (
      "Students",
      "Over 18",
      "Over 30",
      "Family Friendly"
    )

  "Extras list" should "contain all Extra display names" in:
    EventTag.Extras should have size 5
    EventTag.Extras should contain allOf (
      "Dress Code",
      "White Party",
      "Black Party",
      "Free Entry",
      "Reservations Required"
    )

  "EventTag.validateTagList" should "return empty list for empty JSON array" in:
    val tags   = "[]"
    val result = EventTag.validateTagList(tags)
    result shouldBe None

  it should "filter out invalid tags and keep valid ones" in:
    val tags   = """["Party", "InvalidTag", "Concert", "AnotherInvalidTag", "Rock"]"""
    val result = EventTag.validateTagList(tags)

    result.get should have size 3
    result.get should contain(EventTag.EventType.Party)
    result.get should contain(EventTag.EventType.Concert)
    result.get should contain(EventTag.MusicStyle.Rock)

  it should "return empty list for all invalid tags" in:
    val tags   = """["InvalidTag1", "InvalidTag2", "NonExistentTag"]"""
    val result = EventTag.validateTagList(tags)
    result shouldBe None
