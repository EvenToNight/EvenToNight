package infrastructure.persistence.mongo.models.organization

import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile

case class OrganizationDocument(userId: String, account: OrganizationAccount, profile: OrganizationProfile)
