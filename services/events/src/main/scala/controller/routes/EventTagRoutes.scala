package controller.routes
import domain.models.EventTag
import ujson._

class EventTagRoutes extends BaseRoutes:

  @cask.get("/tags")
  def getTags(): cask.Response[ujson.Value] =
    val tags = List(
      ("TypeOfEvent", EventTag.TypeOfEvents),
      ("VenueType", EventTag.VenueTypes),
      ("MusicGenre", EventTag.MusicGenres),
      ("Theme", EventTag.Themes),
      ("Target", EventTag.Targets),
      ("Extra", EventTag.Extras)
    )

    cask.Response(
      Arr.from(
        tags.map { case (category, list) =>
          Obj(
            "category" -> category,
            "tags"     -> Arr.from(list.map(_.toString))
          )
        }
      ),
      statusCode = 200
    )

  @cask.get("/tags/:category")
  def getTagsByCategory(category: String): cask.Response[ujson.Value] =
    val tagList = category match
      case "TypeOfEvent" => EventTag.TypeOfEvents
      case "VenueType"   => EventTag.VenueTypes
      case "MusicGenre"  => EventTag.MusicGenres
      case "Theme"       => EventTag.Themes
      case "Target"      => EventTag.Targets
      case "Extra"       => EventTag.Extras
      case _             => List.empty
    cask.Response(
      Arr.from(tagList.map(_.toString)),
      statusCode = 200
    )

  initialize()
