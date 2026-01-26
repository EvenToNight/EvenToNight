import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { MessageSentCommand } from "../commands/message-sent.command";

export class MessageSentHandler {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(_command: MessageSentCommand): Promise<void> {}
}
