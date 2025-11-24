package controller.routes
import domain.models.EventTag
import ujson._

class EventTagApi extends BaseRoutes:

  @cask.get("/tags")
  def getTags(): Arr =
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

  initialize()
