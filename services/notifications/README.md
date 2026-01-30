REVIEW
{
	type: "review",
      	metadata: {
        	eventId: payload.eventId,
        	userId: payload.userId,
        	userName: payload.userName,
        	userAvatar: payload.userAvatar,
      	},
}

LIKE
{
	id: NotificationId,
	type: “like”,
	metadata: {
        	eventId: payload.eventId,
        	eventName: payload.eventName,
        	userId: payload.userId,
        	userName: payload.userName,
        	userAvatar: payload.userAvatar,
      },
}
		

FOLLOW
{
	id: NotificationId
	type: "follow",
	metadata: {
		followerId
		followerName
		followerAvatar
	} 
}

MESSAGE
{
	type: "message",
	metadata: {
		conversationId,
		senderId,
		senderName,
		message,
		messageId,
		senderAvatar,
	},
}

NEW_EVENT
{
	type="new_event”
	metadata:  {
		creatorId,
            	eventId,
            	eventName,
            	creatorName
	}
}
