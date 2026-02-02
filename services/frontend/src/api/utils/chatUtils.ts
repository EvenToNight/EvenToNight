import type { ChatUser, Conversation } from '../types/chat'
import type { UserID } from '../types/users'

export function getConversationAvatar(currentUserId: UserID, conversation: Conversation): string {
  const isCurrentUserMember = currentUserId === conversation.member.id
  return isCurrentUserMember ? conversation.organization.avatar : conversation.member.avatar
}

export function getConversationName(currentUserId: UserID, conversation: Conversation): string {
  const isCurrentUserMember = currentUserId === conversation.member.id
  return isCurrentUserMember ? conversation.organization.name : conversation.member.name
}

export function getOtherUser(currentUserId: UserID, conversation: Conversation): ChatUser {
  const isCurrentUserMember = currentUserId === conversation.member.id
  return isCurrentUserMember ? conversation.organization : conversation.member
}
