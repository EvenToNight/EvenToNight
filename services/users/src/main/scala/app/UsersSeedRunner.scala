package app

import cask.FormFile
import infrastructure.Wiring.authService
import infrastructure.Wiring.mediaBaseUrl
import infrastructure.Wiring.userService
import infrastructure.media.MediaServiceClient.uploadAvatarToMediaService
import io.undertow.util.HeaderMap
import model.Member
import model.Organization
import model.RegisteredUser
import model.ValidRegistration
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import seed.UserSeed
import seed.UsersSeed

import java.nio.file.Paths
import java.time.Instant

object UsersSeedRunner extends App:
  val usersEither: Either[String, List[UserSeed]] = UsersSeed.loadFromJSON("infrastructure/seed/seed-output/users.json")

  usersEither match
    case Left(err) =>
      println(s"Seed failed: $err")
    case Right(users) =>
      val result: Either[String, Unit] =
        users.foldLeft(Right(()): Either[String, Unit])((acc, u) =>
          acc.flatMap(_ =>
            val registration = ValidRegistration(
              username = u.username,
              email = u.email,
              password = u.password,
              role = u.role
            )

            for
              userId <- authService.createUserWithRole(registration)

              avatarUrl = (u.role, u.ref) match
                case ("organization", "org1") =>
                  val avatarPath = Paths.get("infrastructure/seed/users/data/avatars/org1.jpg")
                  val avatarFile = FormFile(
                    fileName = "org1.jpg",
                    filePath = Some(avatarPath),
                    headers = new HeaderMap()
                  )
                  uploadAvatarToMediaService(userId, Some(avatarFile))
                  s"http://${mediaBaseUrl}/users/$userId/avatar.jpg"
                case _ =>
                  u.avatar

              registeredUser: RegisteredUser = u.role match
                case "member" =>
                  Member(
                    MemberAccount(
                      username = u.username,
                      email = u.email,
                      darkMode = u.darkMode.getOrElse(false),
                      language = u.language.getOrElse("en"),
                      gender = u.gender,
                      birthDate = u.birthDate.map(Instant.parse),
                      interests = u.interests
                    ),
                    MemberProfile(
                      name = u.name,
                      avatar = u.avatar,
                      bio = u.bio
                    )
                  )
                case "organization" =>
                  Organization(
                    OrganizationAccount(
                      username = u.username,
                      email = u.email,
                      darkMode = u.darkMode.getOrElse(false),
                      language = u.language.getOrElse("en"),
                      interests = u.interests
                    ),
                    OrganizationProfile(
                      name = u.name,
                      avatar = avatarUrl,
                      bio = u.bio,
                      contacts = u.contacts
                    )
                  )

              _ <- userService.insertUser(registeredUser, userId)
            yield ()
          )
        )

      result match
        case Left(err) => println(s"Error loading users from JSON: $err")
        case Right(_)  => println("All users initialized successfully!")
