import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Conversation,
  ConversationDocument,
} from '../schemas/conversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ParticipantRole } from '../schemas/participant.schema';
import { SendMessageDto } from '../dto/send-message.dto';
import { Message, MessageDocument } from '../schemas/message.schema';
import { GetConversationsQueryDto } from '../dto/get-conversations-query.dto';
import { ConversationListResponse } from '../dto/conversation-list.response';
import { ConversationListItemDTO } from '../dto/conversation-list-item.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { MessageListResponse } from '../dto/message-list.response';
import { MessageDTO } from '../dto/message.dto';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<any>,
    @InjectModel('Participant')
    private readonly participantModel: Model<any>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<any>,
    private readonly usersService: UsersService,
  ) {}

  private async findOrCreateConversation(
    organizationId: string,
    memberId: string,
  ): Promise<any> {
    await this.usersService.userExists(organizationId);
    await this.usersService.userExists(memberId);

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
    await this.usersService.userExists(userId);

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

        const [orgInfo, memberInfo] = await Promise.all([
          this.usersService.getUserInfo(conversation.organizationId),
          this.usersService.getUserInfo(conversation.memberId),
        ]);

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
    await this.usersService.userExists(userId);

    const participants = await this.participantModel.find({ userId });

    return participants.reduce((total, participant) => {
      return total + participant.unreadCount;
    }, 0);
  }

  async getConversationById(
    conversationId: string,
  ): Promise<ConversationDocument> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Invalid conversation ID');
    }

    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async verifyUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    await this.usersService.userExists(userId);

    const participant = await this.participantModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId,
    });

    return !!participant;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    await this.usersService.userExists(userId);

    const { limit = 50, offset = 0 } = query;

    const isParticipant = await this.verifyUserInConversation(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this conversation',
      );
    }

    const participant = await this.participantModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId,
    });

    const messages = await this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit + 1)
      .exec();

    const hasMore = messages.length > limit;
    const items = messages.slice(0, limit);

    const senderIds = [...new Set(items.map((msg) => msg.senderId))];

    const usersInfo = await Promise.all(
      senderIds.map(async (id) => {
        const user = await this.usersService.getUserInfo(id);
        return (
          user || {
            userId: id,
            name: 'Unknown User',
            avatar: 'Unknown Avatar',
          }
        );
      }),
    );

    const usersMap = new Map(usersInfo.map((user) => [user.userId, user]));

    const messageDTOs: MessageDTO[] = items.map((message) => {
      const senderInfo = usersMap.get(message.senderId);

      return {
        id: message._id.toString(),
        conversationId: conversationId,
        sender: {
          id: message.senderId,
          name: senderInfo?.name || 'Unknown User',
          avatar: senderInfo?.avatar || 'Unknown Avatar',
        },
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.createdAt <= participant.lastReadAt,
      };
    });

    return {
      items: messageDTOs,
      limit,
      offset,
      hasMore,
    };
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const isParticipant = await this.verifyUserInConversation(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this conversation',
      );
    }

    await this.participantModel.updateOne(
      {
        conversationId: new Types.ObjectId(conversationId),
        userId,
      },
      {
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    );
  }
}
