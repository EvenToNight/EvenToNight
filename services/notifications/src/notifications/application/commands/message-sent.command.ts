export class MessageSentCommand {
  conversationId: string;
  senderId: string;
  recipientId: string;
  createdAt: Date;
  messageContent: string;
}
