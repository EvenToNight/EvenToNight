import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { RabbitMqPublisherService } from '../../rabbitmq/rabbitmq-publisher.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class MessageManagerService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<any>,
    @InjectModel('Conversation') private readonly conversationModel: Model<any>,
    @InjectModel('Participant') private readonly participantModel: Model<any>,
    private readonly rabbitMqPublisher: RabbitMqPublisherService,
    private readonly usersService: UsersService,
  ) {}

  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    const message = await new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      senderId,
      content,
    }).save();

    await this.updateConversationTimestamp(conversationId);

    await this.incrementRecipientUnreadCount(conversationId, senderId);

    console.log(`✅ Message sent in conversation ${conversationId}`);

    // Publish event to RabbitMQ for real-time notifications
    const recipientParticipant = await this.participantModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId: { $ne: senderId },
    });

    if (recipientParticipant) {
      const senderInfo = await this.usersService.getUserInfo(senderId);

      await this.rabbitMqPublisher.publishMessageCreated({
        receiverId: recipientParticipant.userId,
        conversationId,
        senderId,
        senderName: senderInfo?.name || '',
        messageId: message._id.toString(),
        message: content,
        senderAvatar: senderInfo?.avatar || '',
      });
    }

    return message;
  }

  async fetchMessages(
    conversationId: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit + 1)
      .exec();
  }

  private async updateConversationTimestamp(
    conversationId: string,
  ): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: conversationId },
      { updatedAt: new Date() },
    );
  }

  private async incrementRecipientUnreadCount(
    conversationId: string,
    senderId: string,
  ): Promise<void> {
    await this.participantModel.updateOne(
      {
        conversationId: new Types.ObjectId(conversationId),
        userId: { $ne: senderId },
      },
      { $inc: { unreadCount: 1 } },
    );
  }
}
