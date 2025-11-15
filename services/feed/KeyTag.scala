enum KeyTag(val displayName: String) extends EventTag:
    case Popular       extends KeyTag("Popular")
    case RecentlyAdded extends KeyTag("Recently Added")
    case ComingSoon    extends KeyTag("Coming Soon")
    case FriendsGoing  extends KeyTag("Popular With Friends")
    case Nearby        extends KeyTag("Nearby")