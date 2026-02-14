package domain.repository

import domain.aggregates.Organization

trait OrganizationRepository:
  def insert(org: Organization, userId: String): Unit
  def getAllOrganizations(): List[(String, Organization)]
  def findById(userId: String): Option[Organization]
  def delete(userId: String): Unit
  def update(updatedOrg: Organization, userId: String): Unit
  def updateAvatar(userId: String, newAvatar: String): Option[Organization]
  def search(prefix: Option[String], limit: Int): List[(String, Organization)]
