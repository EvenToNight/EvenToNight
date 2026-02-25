package infrastructure.persistence.mongo.models.member

import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile

case class MemberDocument(userId: String, account: MemberAccount, profile: MemberProfile)
