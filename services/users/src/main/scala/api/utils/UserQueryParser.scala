package api.utils

import api.dto.request.query.SearchUsersQueryDTO
import model.UserRole
import model.query.SearchUsersQuery

import scala.collection.mutable.ListBuffer

object UserQueryParser:
  val defaultLimit  = 10
  val maxLimit      = 20
  val defaultOffset = 0

  def parse(dto: SearchUsersQueryDTO): Either[List[String], SearchUsersQuery] =
    val errors = ListBuffer.empty[String]

    val parsedRole: Option[UserRole] =
      dto.role.flatMap(role =>
        role match
          case "member"       => Some(UserRole.MemberRole)
          case "organization" => Some(UserRole.OrganizationRole)
          case other =>
            errors += s"Invalid role: $other"
            None
      )

    val normalizedPrefix: Option[String] = dto.prefix.map(_.trim.toLowerCase).filter(_.nonEmpty)

    val finalLimit: Int = dto.limit match
      case Some(l) if l > 0 => Math.min(l, maxLimit)
      case Some(l) =>
        errors += s"Limit must be positive, got $l"
        defaultLimit
      case None => defaultLimit

    val finalOffset: Int = dto.offset match
      case Some(o) if o >= 0 => o
      case Some(o) =>
        errors += s"Offset must be non-negative, got $o"
        defaultOffset
      case None => defaultOffset

    if errors.nonEmpty then Left(errors.toList)
    else
      Right(SearchUsersQuery(parsedRole, normalizedPrefix, finalLimit, finalOffset))
