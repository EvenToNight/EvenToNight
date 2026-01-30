import { EventPublisher } from "../../domain/events/event-publisher.interface";

export class MessageReceivedEvent {
  constructor(
    public readonly receiverId: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly message: string,
    public readonly messageId: string,
    public readonly senderAvatar: string,
  ) {}
}

export class ProcessMessageEventHandler {
  constructor(private readonly eventPublisher: EventPublisher) {}

  async execute(payload: any): Promise<void> {
    console.log("💬 Processing message event (no DB save)");

    const event = new MessageReceivedEvent(
      payload.receiverId,
      payload.conversationId,
      payload.senderId,
      payload.senderName,
      payload.message,
      payload.messageId,
      payload.senderAvatar,
    );

    await this.eventPublisher.publish(event);

    console.log("✅ Message event published (socket only)");
  }
}
