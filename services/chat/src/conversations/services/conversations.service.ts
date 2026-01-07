import { BadRequestException, Injectable } from '@nestjs/common';
import { Conversation } from '../schemas/conversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParticipantRole } from '../schemas/participant.schema';
import { SendMessageDto } from '../dto/send-message.dto';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<any>,
    @InjectModel('Participant')
    private readonly participantModel: Model<any>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<any>,
  ) {}

  private async findOrCreateConversation(
    organizationId: string,
    memberId: string,
  ): Promise<any> {
    // TODO: Check if organizationId and memberId exist

    let conversation = await this.conversationModel.findOne({
      organizationId,
      memberId,
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        organizationId,
        memberId,
      });
      const savedConversation = await conversation.save();

      const orgParticipant = new this.participantModel({
        conversationId: savedConversation._id,
        userId: organizationId,
        role: ParticipantRole.ORGANIZATION,
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      const memberParticipant = new this.participantModel({
        conversationId: savedConversation._id,
        userId: memberId,
        role: ParticipantRole.MEMBER,
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      await Promise.all([orgParticipant.save(), memberParticipant.save()]);

      conversation = savedConversation;
    }

    return conversation;
  }

  async sendMessage(
    organizationId: string,
    memberId: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    if (dto.senderId !== organizationId && dto.senderId !== memberId) {
      throw new BadRequestException(
        'Sender must be either organization or member',
      );
    }

    const conversation = await this.findOrCreateConversation(
      organizationId,
      memberId,
    );

    const message = new this.messageModel({
      conversationId: conversation._id,
      senderId: dto.senderId,
      content: dto.content,
    });
    const savedMessage = await message.save();

    conversation.updatedAt = new Date();
    await conversation.save();

    await this.participantModel.updateOne(
      {
        conversationId: conversation._id,
        userId: { $ne: dto.senderId },
      },
      {
        $inc: { unreadCount: 1 },
      },
    );

    console.log(`✅ Message sent in conversation ${conversation._id}`);

    // TODO: Publish event to rabbitmq

    return savedMessage;
  }
}
