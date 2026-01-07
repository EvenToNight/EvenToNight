package model

import ujson.Obj
import ujson.Value

object UsersConversions:
  extension (user: RegisteredUser)
    def asJson: Value =
      user match
        case member: Member =>
          Obj(
            "role" -> "member",
            "account" -> Obj(
              "email" -> member.account.email
            ),
            "profile" -> Obj(
              "name" -> member.profile.name
            )
          )
        case org: Organization =>
          Obj(
            "role" -> "organization",
            "account" -> Obj(
              "email" -> org.account.email
            ),
            "profile" -> Obj(
              "name" -> org.profile.name
            )
          )
