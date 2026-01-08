import { BadRequestException, Injectable } from '@nestjs/common';
import { Conversation } from '../schemas/conversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParticipantRole } from '../schemas/participant.schema';
import { SendMessageDto } from '../dto/send-message.dto';
import { Message, MessageDocument } from '../schemas/message.schema';
import { GetConversationsQueryDto } from '../dto/get-conversations-query.dto';
import { ConversationListResponse } from '../dto/conversation-list.response';
import { ConversationListItemDTO } from '../dto/conversation-list-item.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Types } from 'mongoose';

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

  async getUserConversations(
    userId: string,
    query: GetConversationsQueryDto,
  ): Promise<ConversationListResponse> {
    // TODO: Check if userId exist

    const { limit = 20, offset = 0 } = query;

    const participants = await this.participantModel
      .find({ userId })
      .populate('conversationId')
      .sort({ 'conversationId.updatedAt': -1 })
      .skip(offset)
      .limit(limit + 1)
      .exec();

    const hasMore = participants.length > limit;
    const items = participants.slice(0, limit);

    const conversations: ConversationListItemDTO[] = await Promise.all(
      items.map(async (participant) => {
        const conversation = participant.conversationId;

        const lastMessage = await this.messageModel
          .findOne({ conversationId: conversation._id })
          .sort({ createdAt: -1 })
          .exec();

        // const [orgInfo, memberInfo] = await Promise.all([
        //   this.usersService.getUserInfo(conversation.organizationId),
        //   this.usersService.getUserInfo(conversation.memberId),
        // ]);

        // TODO: Replace with real user info fetching
        const orgInfo = {
          name: 'Org Name',
          avatar: 'https://via.placeholder.com/150',
        };
        const memberInfo = {
          name: 'Member Name',
          avatar: 'https://via.placeholder.com/150',
        };

        return {
          id: conversation._id.toString(),
          organizationId: conversation.organizationId,
          organizationName: orgInfo?.name || 'Unknown Organization',
          organizationAvatar:
            orgInfo?.avatar || 'https://via.placeholder.com/150',
          memberId: conversation.memberId,
          memberName: memberInfo?.name || 'Unknown Member',
          memberAvatar: memberInfo?.avatar || 'https://via.placeholder.com/150',
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderId: String(lastMessage.senderId),
                timestamp: lastMessage.createdAt,
              }
            : {
                content: '',
                senderId: '',
                timestamp: new Date(0),
              },
          unreadCount: participant.unreadCount,
        };
      }),
    );

    return {
      items: conversations,
      limit,
      offset,
      hasMore,
    };
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    // TODO: Check if userId exist

    const participants = await this.participantModel.find({ userId });

    return participants.reduce((total, participant) => {
      return total + participant.unreadCount;
    }, 0);
  }

  async getConversationById(conversationId: string): Promise<Conversation> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Invalid conversation ID');
    }

    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }
}
