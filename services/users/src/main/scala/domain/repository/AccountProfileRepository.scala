package domain.repository

trait AccountProfileRepository[A, P]:
  def insert(account: A, profile: P, userId: String): Unit
  def getAll(): List[(String, A, P)]
  def findById(userId: String): Option[(A, P)]
  def delete(userId: String): Unit
  def update(account: A, profile: P, userId: String): Unit
  def updateProfileAvatar(userId: String, newAvatar: String): Option[(A, P)]
  def search(prefix: Option[String], limit: Int, getUsername: A => String, getName: P => String): List[(String, A, P)]
