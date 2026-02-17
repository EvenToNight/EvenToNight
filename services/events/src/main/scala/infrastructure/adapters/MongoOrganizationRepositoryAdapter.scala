package infrastructure.adapters

import domain.repositories.{OrganizationRepository, TransactionContext}
import domain.valueobjects.OrganizationId
import infrastructure.db.MongoUserMetadataRepository as InfraUserMetadataRepo

class MongoOrganizationRepositoryAdapter(
    private val userMetadataRepository: InfraUserMetadataRepo
) extends OrganizationRepository:

  override def isOrganization(userId: OrganizationId): Boolean =
    userMetadataRepository.findById(userId.value) match
      case Some(userMetadata) if userMetadata.role == "organization" => true
      case _                                                         => false

  override def isOrganization(userId: OrganizationId, ctx: TransactionContext): Boolean =
    ctx match
      case mongoCtx: MongoTransactionContext =>
        userMetadataRepository.findById(userId.value, mongoCtx.session) match
          case Some(userMetadata) if userMetadata.role == "organization" => true
          case _                                                         => false
      case _ =>
        // Fallback to non-transactional if context is not MongoDB
        isOrganization(userId)

  override def getOrganizationName(userId: OrganizationId): Option[String] =
    userMetadataRepository.findById(userId.value).map(_.name)
