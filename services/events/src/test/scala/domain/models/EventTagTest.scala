package domain.models

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class EventTagTest extends AnyFlatSpec with Matchers:

  "TypeOfEvent enum" should "have correct display names" in:
    EventTag.TypeOfEvent.Party.displayName shouldBe "Party"
    EventTag.TypeOfEvent.LiveMusic.displayName shouldBe "Live Music"
    EventTag.TypeOfEvent.Concert.displayName shouldBe "Concert"
    EventTag.TypeOfEvent.DJSet.displayName shouldBe "DJ Set"
    EventTag.TypeOfEvent.Karaoke.displayName shouldBe "Karaoke"
    EventTag.TypeOfEvent.PreDinner.displayName shouldBe "Pre Dinner"
    EventTag.TypeOfEvent.Dinner.displayName shouldBe "Dinner"
    EventTag.TypeOfEvent.NewOpening.displayName shouldBe "New Opening"

  it should "extend EventTag" in:
    EventTag.TypeOfEvent.Party shouldBe an[EventTag]
    EventTag.TypeOfEvent.Concert shouldBe an[EventTag]

  "VenueType enum" should "have correct display names" in:
    EventTag.VenueType.Club.displayName shouldBe "Club"
    EventTag.VenueType.Pub.displayName shouldBe "Pub"
    EventTag.VenueType.Bar.displayName shouldBe "Bar"
    EventTag.VenueType.Restaurant.displayName shouldBe "Restaurant"
    EventTag.VenueType.Theatre.displayName shouldBe "Theatre"
    EventTag.VenueType.OpenPlace.displayName shouldBe "Open Place"

  it should "extend EventTag" in:
    EventTag.VenueType.Club shouldBe an[EventTag]
    EventTag.VenueType.Bar shouldBe an[EventTag]

  "MusicGenre enum" should "have correct display names" in:
    EventTag.MusicGenre.House.displayName shouldBe "House"
    EventTag.MusicGenre.Techno.displayName shouldBe "Techno"
    EventTag.MusicGenre.Commercial.displayName shouldBe "Commercial"
    EventTag.MusicGenre.Reggaeton.displayName shouldBe "Reggaeton"
    EventTag.MusicGenre.Trap.displayName shouldBe "Trap"
    EventTag.MusicGenre.HipHop.displayName shouldBe "Hip Hop"
    EventTag.MusicGenre.Rock.displayName shouldBe "Rock"
    EventTag.MusicGenre.Pop.displayName shouldBe "Pop"
    EventTag.MusicGenre.Jazz.displayName shouldBe "Jazz"
    EventTag.MusicGenre.Blues.displayName shouldBe "Blues"
    EventTag.MusicGenre.Indie.displayName shouldBe "Indie"

  it should "extend EventTag" in:
    EventTag.MusicGenre.House shouldBe an[EventTag]
    EventTag.MusicGenre.Jazz shouldBe an[EventTag]

  "Theme enum" should "have correct display names" in:
    EventTag.Theme.Halloween.displayName shouldBe "Halloween"
    EventTag.Theme.Christmas.displayName shouldBe "Christmas"
    EventTag.Theme.NewYear.displayName shouldBe "New Year"
    EventTag.Theme.Carnival.displayName shouldBe "Carnival"
    EventTag.Theme.GraduationParty.displayName shouldBe "Graduation Party"
    EventTag.Theme.BirthdayParty.displayName shouldBe "Birthday Party"
    EventTag.Theme.PrivateEvent.displayName shouldBe "Private Event"
    EventTag.Theme.WhiteParty.displayName shouldBe "White Party"
    EventTag.Theme.BlackParty.displayName shouldBe "Black Party"
    EventTag.Theme.PoolParty.displayName shouldBe "Pool Party"
    EventTag.Theme.Festival.displayName shouldBe "Festival"
    EventTag.Theme.StreetFood.displayName shouldBe "Street Food"
    EventTag.Theme.StandUpComedy.displayName shouldBe "Stand Up Comedy"

  it should "extend EventTag" in:
    EventTag.Theme.Halloween shouldBe an[EventTag]
    EventTag.Theme.Festival shouldBe an[EventTag]

  "Target enum" should "have correct display names" in:
    EventTag.Target.Students.displayName shouldBe "Students"
    EventTag.Target.Over18.displayName shouldBe "Over 18"
    EventTag.Target.Over30.displayName shouldBe "Over 30"
    EventTag.Target.OnlyInvitation.displayName shouldBe "Only Invitation"
    EventTag.Target.FreeEntry.displayName shouldBe "Free Entry"
    EventTag.Target.Vip.displayName shouldBe "VIP"
    EventTag.Target.Charity.displayName shouldBe "Charity"

  it should "extend EventTag" in:
    EventTag.Target.Students shouldBe an[EventTag]
    EventTag.Target.Vip shouldBe an[EventTag]

  "Extra enum" should "have correct display names" in:
    EventTag.Extra.ReservationRequired.displayName shouldBe "Reservation Required"
    EventTag.Extra.DressCode.displayName shouldBe "Dress Code"
    EventTag.Extra.FreeParking.displayName shouldBe "Free Parking"

  it should "extend EventTag" in:
    EventTag.Extra.DressCode shouldBe an[EventTag]
    EventTag.Extra.FreeParking shouldBe an[EventTag]

  "TypeOfEvents list" should "contain all TypeOfEvent display names" in:
    EventTag.TypeOfEvents should have size 8
    EventTag.TypeOfEvents should contain allOf (
      "Party",
      "Live Music",
      "Concert",
      "DJ Set",
      "Karaoke",
      "Pre Dinner",
      "Dinner",
      "New Opening"
    )

  "VenueTypes list" should "contain all VenueType display names" in:
    EventTag.VenueTypes should have size 6
    EventTag.VenueTypes should contain allOf (
      "Club",
      "Pub",
      "Bar",
      "Restaurant",
      "Theatre",
      "Open Place"
    )

  "MusicGenres list" should "contain all MusicGenre display names" in:
    EventTag.MusicGenres should have size 11
    EventTag.MusicGenres should contain allOf (
      "House",
      "Techno",
      "Commercial",
      "Reggaeton",
      "Trap",
      "Hip Hop",
      "Rock",
      "Pop",
      "Jazz",
      "Blues",
      "Indie"
    )

  "Themes list" should "contain all Theme display names" in:
    EventTag.Themes should have size 13
    EventTag.Themes should contain allOf (
      "Halloween",
      "Christmas",
      "New Year",
      "Carnival",
      "Graduation Party",
      "Birthday Party",
      "Private Event",
      "White Party",
      "Black Party",
      "Pool Party",
      "Festival",
      "Street Food",
      "Stand Up Comedy"
    )

  "Targets list" should "contain all Target display names" in:
    EventTag.Targets should have size 7
    EventTag.Targets should contain allOf (
      "Students",
      "Over 18",
      "Over 30",
      "Only Invitation",
      "Free Entry",
      "VIP",
      "Charity"
    )

  "Extras list" should "contain all Extra display names" in:
    EventTag.Extras should have size 3
    EventTag.Extras should contain allOf (
      "Reservation Required",
      "Dress Code",
      "Free Parking"
    )
