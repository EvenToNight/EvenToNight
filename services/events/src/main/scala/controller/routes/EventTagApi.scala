package controller.routes
import domain.models.EventTag
import ujson._

class EventTagApi extends BaseRoutes:

  @cask.get("/tags")
  def getTags() =
    val tags = List(
      ("TypeOfEvent", EventTag.TypeOfEvents),
      ("VenueType", EventTag.VenueTypes),
      ("MusicGenre", EventTag.MusicGenres),
      ("Theme", EventTag.Themes),
      ("Target", EventTag.Targets),
      ("Extra", EventTag.Extras)
    )

    Arr.from(
      tags.map { case (category, tagList) =>
        Obj(
          "category" -> category,
          "tags"     -> Arr.from(tagList.map(t => Str(t.toString)))
        )
      }
    )

  @cask.get("/tags/:category")
  def getTagsByCategory(category: String) =
    val tags = category match {
      case "TypeOfEvent" => EventTag.TypeOfEvents
      case "VenueType"   => EventTag.VenueTypes
      case "MusicGenre"  => EventTag.MusicGenres
      case "Theme"       => EventTag.Themes
      case "Target"      => EventTag.Targets
      case "Extra"       => EventTag.Extras
      case _             => List.empty
    }

    Obj("category" -> category, "tags" -> ujson.Arr.from(tags.map(t => Str(t.toString))))

  initialize()
