package domain.models

object EventStatusTransitions:

  private val validTransitions: Map[EventStatus, Set[EventStatus]] = Map(
    EventStatus.DRAFT     -> Set(EventStatus.PUBLISHED),
    EventStatus.PUBLISHED -> Set(EventStatus.CANCELLED),
    EventStatus.CANCELLED -> Set(),
    EventStatus.COMPLETED -> Set()
  )

  /** Validates if a transition from currentStatus to newStatus is allowed.
    * @param currentStatus The current event status
    * @param newStatus The desired new event status
    * @return true if the transition is valid, false otherwise
    */
  def isValidTransition(currentStatus: EventStatus, newStatus: EventStatus): Boolean =
    if currentStatus == newStatus then true
    else
      validTransitions
        .get(currentStatus)
        .exists(_.contains(newStatus))

  /** Gets a user-friendly error message for an invalid transition.
    * @param currentStatus The current event status
    * @param newStatus The desired new event status
    * @return An error message describing why the transition is invalid
    */
  def getTransitionErrorMessage(currentStatus: EventStatus, newStatus: EventStatus): String =
    if currentStatus == newStatus then
      s"Event is already in ${currentStatus.asString} status"
    else
      s"Cannot transition from ${currentStatus.asString} to ${newStatus.asString}. " +
        s"Valid transitions from ${currentStatus.asString} are: ${validTransitions(currentStatus).map(_.asString).mkString(", ") match
            case "" => "none (terminal state)"
            case s  => s
          }"
