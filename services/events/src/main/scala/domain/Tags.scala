package domain

sealed trait EventTag:
  val displayName: String

object EventTag:
  enum TypeOfEvent(val displayName: String) extends EventTag:
    case Party      extends TypeOfEvent("Party")
    case LiveMusic  extends TypeOfEvent("Live Music")
    case Concert    extends TypeOfEvent("Concert")
    case DJSet      extends TypeOfEvent("DJ Set")
    case Karaoke    extends TypeOfEvent("Karaoke")
    case PreDinner  extends TypeOfEvent("Pre Dinner")
    case Dinner     extends TypeOfEvent("Dinner")
    case NewOpening extends TypeOfEvent("New Opening")

  enum VenueType(val displayName: String) extends EventTag:
    case Club       extends VenueType("Club")
    case Pub        extends VenueType("Pub")
    case Bar        extends VenueType("Bar")
    case Restaurant extends VenueType("Restaurant")
    case Theatre    extends VenueType("Theatre")
    case OpenPlace  extends VenueType("Open Place")

  enum MusicGenre(val displayName: String) extends EventTag:
    case House      extends MusicGenre("House")
    case Techno     extends MusicGenre("Techno")
    case Commercial extends MusicGenre("Commercial")
    case Reggaeton  extends MusicGenre("Reggaeton")
    case Trap       extends MusicGenre("Trap")
    case HipHop     extends MusicGenre("Hip Hop")
    case Rock       extends MusicGenre("Rock")
    case Pop        extends MusicGenre("Pop")
    case Jazz       extends MusicGenre("Jazz")
    case Blues      extends MusicGenre("Blues")
    case Indie      extends MusicGenre("Indie")

  enum Theme(val displayName: String) extends EventTag:
    case Halloween       extends Theme("Halloween")
    case Christmas       extends Theme("Christmas")
    case NewYear         extends Theme("New Year")
    case Carnival        extends Theme("Carnival")
    case GraduationParty extends Theme("Graduation Party")
    case BirthdayParty   extends Theme("Birthday Party")
    case PrivateEvent    extends Theme("Private Event")
    case WhiteParty      extends Theme("White Party")
    case BlackParty      extends Theme("Black Party")
    case PoolParty       extends Theme("Pool Party")
    case Festival        extends Theme("Festival")
    case StreetFood      extends Theme("Street Food")
    case StandUpComedy   extends Theme("Stand Up Comedy")

  enum Target(val displayName: String) extends EventTag:
    case Students       extends Target("Students")
    case Over18         extends Target("Over 18")
    case Over30         extends Target("Over 30")
    case OnlyInvitation extends Target("Only Invitation")
    case FreeEntry      extends Target("Free Entry")
    case Vip            extends Target("VIP")
    case Charity        extends Target("Charity")

  enum Extra(val displayName: String) extends EventTag:
    case ReservationRequired extends Extra("Reservation Required")
    case DressCode           extends Extra("Dress Code")
    case FreeParking         extends Extra("Free Parking")

  val TypeOfEvents: List[String] = TypeOfEvent.values.map(_.displayName).toList
  val VenueTypes: List[String]   = VenueType.values.map(_.displayName).toList
  val MusicGenres: List[String]  = MusicGenre.values.map(_.displayName).toList
  val Themes: List[String]       = Theme.values.map(_.displayName).toList
  val Targets: List[String]      = Target.values.map(_.displayName).toList
  val Extras: List[String]       = Extra.values.map(_.displayName).toList
