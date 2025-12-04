package domain.models

enum EventStatus:
  case DRAFT, PUBLISHED, CANCELLED, COMPLETED

object EventStatus:
  def withNameOpt(name: String): Option[EventStatus] =
    name.toUpperCase match
      case "DRAFT"     => Some(EventStatus.DRAFT)
      case "PUBLISHED" => Some(EventStatus.PUBLISHED)
      case "CANCELLED" => Some(EventStatus.CANCELLED)
      case "COMPLETED" => Some(EventStatus.COMPLETED)
      case _           => None
