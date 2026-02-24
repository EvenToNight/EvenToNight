package domain.repository

import domain.aggregates.Member

trait MemberRepository:
  def insert(member: Member, userId: String): Unit
  def getAllMembers(): List[(String, Member)]
  def findById(userId: String): Option[Member]
  def delete(userId: String): Unit
  def update(updatedMember: Member, userId: String): Unit
  def updateAvatar(userId: String, newAvatar: String): Option[Member]
  def search(prefix: Option[String], limit: Int): List[(String, Member)]
