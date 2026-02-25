package domain.repositories

import domain.valueobjects.OrganizationId

trait OrganizationRepository:

  def isOrganization(userId: OrganizationId): Boolean

  def isOrganization(userId: OrganizationId, ctx: TransactionContext): Boolean

  def getOrganizationName(userId: OrganizationId): Option[String]
