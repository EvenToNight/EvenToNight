package domain.services

import domain.repositories.OrganizationRepository
import domain.valueobjects.OrganizationId

class EventDomainService(organizationRepository: OrganizationRepository):

  def validateCreatorIsOrganization(creatorId: OrganizationId): Either[String, Unit] =
    if organizationRepository.isOrganization(creatorId) then
      Right(())
    else
      Left(s"Only organizations can create events. ${creatorId.value} is not an organization.")

  def validateCollaboratorsAreOrganizations(
      collaboratorIds: List[OrganizationId]
  ): Either[String, Unit] =
    val invalidCollaborator = collaboratorIds.find { collaboratorId =>
      !organizationRepository.isOrganization(collaboratorId)
    }

    invalidCollaborator match
      case Some(collaboratorId) =>
        Left(s"Only organizations can be collaborators. ${collaboratorId.value} is not an organization.")
      case None =>
        Right(())

  def getOrganizationNameOrEmpty(organizationId: OrganizationId): String =
    organizationRepository.getOrganizationName(organizationId).getOrElse("")
