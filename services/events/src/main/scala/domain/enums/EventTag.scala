package domain.enums

sealed trait EventTag:
  val displayName: String

object EventTag:
  class InvalidTag() extends EventTag:
    val displayName: String = "Invalid Tag"

  enum EventType(val displayName: String) extends EventTag:
    case LiveMusic extends EventType("Live Music")
    case Concert   extends EventType("Concert")
    case DJSet     extends EventType("DJ Set")
    case Party     extends EventType("Party")
    case Dinner    extends EventType("Dinner")
    case Karaoke   extends EventType("Karaoke")
    case Show      extends EventType("Show")

  enum Venue(val displayName: String) extends EventTag:
    case Club       extends Venue("Club")
    case Pub        extends Venue("Pub")
    case Bar        extends Venue("Bar")
    case Restaurant extends Venue("Restaurant")
    case Theatre    extends Venue("Theatre")
    case Outdoor    extends Venue("Outdoor")

  enum MusicStyle(val displayName: String) extends EventTag:
    case Electronic extends MusicStyle("Electronic")
    case Pop        extends MusicStyle("Pop")
    case HipHop     extends MusicStyle("Hip Hop")
    case Rock       extends MusicStyle("Rock")
    case Reggaeton  extends MusicStyle("Reggaeton")
    case Commercial extends MusicStyle("Commercial")

  enum Special(val displayName: String) extends EventTag:
    case Halloween    extends Special("Halloween")
    case Christmas    extends Special("Christmas")
    case NewYear      extends Special("New Year")
    case Carnival     extends Special("Carnival")
    case PrivateEvent extends Special("Private Event")

  enum Target(val displayName: String) extends EventTag:
    case Students       extends Target("Students")
    case Over18         extends Target("Over 18")
    case Over30         extends Target("Over 30")
    case FamilyFriendly extends Target("Family Friendly")

  enum Extra(val displayName: String) extends EventTag:
    case DressCode            extends Extra("Dress Code")
    case WhiteParty           extends Extra("White Party")
    case BlackParty           extends Extra("Black Party")
    case FreeEntry            extends Extra("Free Entry")
    case ReservationsRequired extends Extra("Reservations Required")

  val EventTypes: List[String]  = EventType.values.map(_.displayName).toList
  val Venues: List[String]      = Venue.values.map(_.displayName).toList
  val MusicStyles: List[String] = MusicStyle.values.map(_.displayName).toList
  val Specials: List[String]    = Special.values.map(_.displayName).toList
  val Targets: List[String]     = Target.values.map(_.displayName).toList
  val Extras: List[String]      = Extra.values.map(_.displayName).toList

  def fromString(value: String): EventTag =
    EventType.values.find(_.displayName.toLowerCase == value.toLowerCase)
      .orElse(Venue.values.find(_.displayName.toLowerCase == value.toLowerCase))
      .orElse(MusicStyle.values.find(_.displayName.toLowerCase == value.toLowerCase))
      .orElse(Special.values.find(_.displayName.toLowerCase == value.toLowerCase))
      .orElse(Target.values.find(_.displayName.toLowerCase == value.toLowerCase))
      .orElse(Extra.values.find(_.displayName.toLowerCase == value.toLowerCase))
      .getOrElse(new InvalidTag)

  def validateTagList(tags: String): Option[List[EventTag]] =
    val tagList =
      if tags.trim.startsWith("[") && tags.trim.endsWith("]") then
        ujson.read(tags).arr.map(_.str).toList
      else
        tags.split(",").map(_.trim).toList
    val eventTags = tagList.map(t => EventTag.fromString(t))
    val validTags = eventTags.filterNot(t => t.isInstanceOf[InvalidTag])
    if validTags.nonEmpty then Some(validTags) else None
