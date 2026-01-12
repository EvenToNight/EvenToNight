import { BadRequestException, Injectable } from '@nestjs/common';
import { Conversation } from '../schemas/conversation.schema';
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
import { CreateConversationMessageDto } from '../dto/create-conversation-message.dto';
import { UserID } from '../types';
import { ConversationDetailDTO } from '../dto/conversation-details.dto';
import { UserRole } from 'src/users/schemas/user.schema';
import { SearchConversationsQueryDto } from '../dto/search-conversation-query.dto';

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

  async createConversationWithMessage(
    senderId: string,
    dto: CreateConversationMessageDto,
  ): Promise<MessageDocument> {
    const existingConversation = await this.findConversationBetweenUsers(
      dto.recipientId,
      senderId,
    );

    if (existingConversation) {
      throw new BadRequestException(
        'Conversation already exists. Use the existing conversation endpoint.',
      );
    }

    const conversation = await this.findOrCreateConversation(
      senderId,
      dto.recipientId,
    );

    const message = await this.createMessage(
      conversation._id.toString(),
      senderId,
      dto.content,
    );

    return message;
  }

  async sendMessageToConversation(
    senderId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    await this.conversationExists(conversationId);

    const isParticipant = await this.verifyUserInConversation(
      conversationId,
      senderId,
    );

    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this conversation',
      );
    }

    return this.createMessage(conversationId, senderId, dto.content);
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
          organization: {
            id: conversation.organizationId,
            name: orgInfo?.name || 'Unknown Organization',
            avatar:
              orgInfo?.avatar ||
              'https://media.eventonight.site/users/default.jpg',
          },
          member: {
            id: conversation.memberId,
            name: memberInfo?.name || 'Unknown Member',
            avatar:
              memberInfo?.avatar ||
              'https://media.eventonight.site/users/default.jpg',
          },
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
    userId: string,
  ): Promise<ConversationDetailDTO> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Invalid conversation ID');
    }

    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = await this.verifyUserInConversation(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this conversation',
      );
    }

    const [orgInfo, memberInfo] = await Promise.all([
      this.usersService.getUserInfo(conversation.organizationId),
      this.usersService.getUserInfo(conversation.memberId),
    ]);

    return {
      id: conversation._id.toString(),
      organization: {
        id: conversation.organizationId,
        name: orgInfo?.name || 'Unknown Organization',
        avatar:
          orgInfo?.avatar || 'https://media.eventonight.site/users/default.jpg',
      },
      member: {
        id: conversation.memberId,
        name: memberInfo?.name || 'Unknown Member',
        avatar:
          memberInfo?.avatar ||
          'https://media.eventonight.site/users/default.jpg',
      },
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
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

    this.markAsRead(conversationId, userId).catch((err) => {
      console.error(
        `Failed to mark messages as read for user ${userId} in conversation ${conversationId}:`,
        err,
      );
    });

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

  async getConversationByUsers(
    organizationId: string,
    memberId: string,
  ): Promise<ConversationDetailDTO> {
    const conversation = await this.conversationModel.findOne({
      organizationId,
      memberId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const [orgInfo, memberInfo] = await Promise.all([
      this.usersService.getUserInfo(organizationId),
      this.usersService.getUserInfo(memberId),
    ]);

    return {
      id: conversation._id.toString(),
      organization: {
        id: organizationId,
        name: orgInfo?.name || 'Unknown Organization',
        avatar:
          orgInfo?.avatar || 'https://media.eventonight.site/users/default.jpg',
      },
      member: {
        id: memberId,
        name: memberInfo?.name || 'Unknown Member',
        avatar:
          memberInfo?.avatar ||
          'https://media.eventonight.site/users/default.jpg',
      },
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async getConversationWithMessagesByUsers(
    organizationId: string,
    memberId: string,
    query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    const conversation = await this.conversationModel.findOne({
      organizationId,
      memberId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return await this.getMessages(conversation._id, memberId, query);
  }

  async searchConversationWithFilters(
    userId: string,
    query: SearchConversationsQueryDto,
  ): Promise<ConversationListResponse> {
    await this.usersService.userExists(userId);

    const { limit = 20, offset = 0, name, recipientId } = query;

    const finalFilter: any = { userId };

    if (name || recipientId) {
      const partnerQuery: any = {
        userId: { $ne: userId },
      };

      if (name) {
        partnerQuery.userName = { $regex: `^${name}`, $options: 'i' };
      }

      if (recipientId) {
        partnerQuery.userId = { $regex: `^${recipientId}`, $options: 'i' };
      }

      const partners = await this.participantModel
        .find(partnerQuery)
        .select('conversationId')
        .exec();

      const conversationIds = partners.map((p) => p.conversationId);

      if (conversationIds.length === 0 && offset === 0) {
        return this.getSuggestedUsers(userId, {
          limit: Number(limit),
          offset: 0,
          name,
          recipientId,
        });
      }

      if (conversationIds.length > 0) {
        finalFilter.conversationId = { $in: conversationIds };
      }
    }

    const myParticipants = await this.participantModel
      .find(finalFilter)
      .populate('conversationId')
      .sort({ 'conversationId.updatedAt': -1 })
      .skip(Number(offset))
      .limit(Number(limit) + 1)
      .exec();

    const hasMore = myParticipants.length > limit;
    const items = myParticipants.slice(0, Number(limit));

    const conversations = await Promise.all(
      items.map(async (participant) => {
        const conversation = participant.conversationId;
        if (!conversation) return null;

        const lastMessage = await this.messageModel
          .findOne({ conversationId: conversation._id })
          .sort({ createdAt: -1 })
          .select('content senderId createdAt')
          .exec();

        const partnerParticipant = await this.participantModel
          .findOne({
            conversationId: conversation._id,
            userId: { $ne: userId },
          })
          .select('userId userName role')
          .exec();

        if (!partnerParticipant) return null;

        const [myUserInfo, partnerUserInfo] = await Promise.all([
          this.usersService.getUserInfo(userId),
          this.usersService.getUserInfo(partnerParticipant.userId),
        ]);

        return {
          id: conversation._id.toString(),
          organization:
            partnerParticipant.role === ParticipantRole.ORGANIZATION
              ? {
                  id: partnerParticipant.userId,
                  name: partnerParticipant.userName,
                  avatar:
                    partnerUserInfo?.avatar ||
                    'https://media.eventonight.site/users/default.jpg',
                }
              : {
                  id: userId,
                  name: participant.userName,
                  avatar:
                    myUserInfo?.avatar ||
                    'https://media.eventonight.site/users/default.jpg',
                },

          member:
            partnerParticipant.role === ParticipantRole.MEMBER
              ? {
                  id: partnerParticipant.userId,
                  name: partnerParticipant.userName,
                  avatar:
                    partnerUserInfo?.avatar ||
                    'https://media.eventonight.site/users/default.jpg',
                }
              : {
                  id: userId,
                  name: participant.userName,
                  avatar:
                    myUserInfo?.avatar ||
                    'https://media.eventonight.site/users/default.jpg',
                },

          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderId: lastMessage.senderId.toString(),
                timestamp: lastMessage.createdAt,
              }
            : null,
          unreadCount: participant.unreadCount,
        };
      }),
    );

    const validConversations = conversations.filter(
      (c): c is ConversationListItemDTO => c !== null,
    );

    const remainingSlots = Number(limit) - validConversations.length;

    if (remainingSlots > 0 && offset === 0) {
      const suggestedResult = await this.getSuggestedUsers(userId, {
        limit: remainingSlots,
        offset: 0,
        name,
        recipientId,
      });

      const existingPartnerIds = new Set(
        validConversations.map((c) =>
          c.organization.id === userId ? c.member.id : c.organization.id,
        ),
      );

      const newSuggestions = suggestedResult.items.filter((item) => {
        const partnerId =
          item.organization.id === userId
            ? item.member.id
            : item.organization.id;
        return !existingPartnerIds.has(partnerId);
      });

      validConversations.push(...newSuggestions.slice(0, remainingSlots));
    }

    return {
      items: validConversations,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: hasMore || validConversations.length === Number(limit),
    };
  }

  private async getSuggestedUsers(
    userId: string,
    options: {
      limit: number;
      offset: number;
      name?: string;
      recipientId?: string;
    },
  ): Promise<ConversationListResponse> {
    const currentUser = await this.usersService.getUserInfo(userId);

    // TODO: implement check of currentUser
    // if (!currentUser) {
    //   return { items: [], limit: options.limit, offset: options.offset, hasMore: false };
    // }
    const currentRole = currentUser ? currentUser.role : UserRole.MEMBER;

    const targetRole =
      currentRole === UserRole.MEMBER ? UserRole.ORGANIZATION : UserRole.MEMBER;

    const userQuery: any = {
      userId: { $ne: userId },
      role: targetRole,
    };

    if (options.name) {
      userQuery.name = { $regex: options.name, $options: 'i' };
    }

    if (options.recipientId) {
      userQuery.userId = { $regex: `^${options.recipientId}`, $options: 'i' };
    }

    const suggestedUsers = await this.usersService.searchUsers(userQuery);

    const limitedUsers = suggestedUsers.slice(
      options.offset,
      options.offset + options.limit + 1,
    );

    const hasMore = limitedUsers.length > options.limit;
    const items = limitedUsers.slice(0, options.limit);

    const myUserInfo = await this.usersService.getUserInfo(userId);

    const suggestions: ConversationListItemDTO[] = items.map((user) => ({
      id: '',
      organization:
        user.role === UserRole.ORGANIZATION
          ? {
              id: user.userId,
              name: user.name || 'Unknown',
              avatar:
                user.avatar ||
                'https://media.eventonight.site/users/default.jpg',
            }
          : {
              id: userId,
              name: myUserInfo?.name || 'Unknown',
              avatar:
                myUserInfo?.avatar ||
                'https://media.eventonight.site/users/default.jpg',
            },
      member:
        user.role === UserRole.MEMBER
          ? {
              id: user.userId,
              name: user.name || 'Unknown',
              avatar:
                user.avatar ||
                'https://media.eventonight.site/users/default.jpg',
            }
          : {
              id: userId,
              name: myUserInfo?.name || 'Unknown',
              avatar:
                myUserInfo?.avatar ||
                'https://media.eventonight.site/users/default.jpg',
            },
      lastMessage: null,
      unreadCount: 0,
    }));

    return {
      items: suggestions,
      limit: options.limit,
      offset: options.offset,
      hasMore,
    };
  }

  private async determineRoles(
    userId1: UserID,
    userId2: UserID,
  ): Promise<{ organizationId: string; memberId: string }> {
    const [user1Info, user2Info] = await Promise.all([
      this.usersService.getUserInfo(userId1),
      this.usersService.getUserInfo(userId2),
    ]);

    if (!user1Info) {
      throw new BadRequestException(`User ${userId1} does not exist`);
    }
    if (!user2Info) {
      throw new BadRequestException(`User ${userId2} does not exist`);
    }

    if (
      user1Info.role === UserRole.ORGANIZATION &&
      user2Info.role === UserRole.MEMBER
    ) {
      return { organizationId: userId1, memberId: userId2 };
    } else if (
      user1Info.role === UserRole.MEMBER &&
      user2Info.role === UserRole.ORGANIZATION
    ) {
      return { organizationId: userId2, memberId: userId1 };
    } else {
      throw new BadRequestException(
        'Conversation must be between an organization and a member',
      );
    }
  }

  private async findOrCreateConversation(
    userId1: string,
    userId2: string,
  ): Promise<any> {
    // TODO: implement real roles assignments
    // const {organizationId, memberId} = await this.determineRoles(userId1, userId2);
    const organizationId = userId2;
    const memberId = userId1;

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

      const organizationName: string =
        (await this.usersService.getUsername(organizationId)) || 'Organization';

      const orgParticipant = new this.participantModel({
        conversationId: savedConversation._id,
        userId: organizationId,
        userName: organizationName,
        role: ParticipantRole.ORGANIZATION,
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      const memberName: string =
        (await this.usersService.getUsername(memberId)) || 'Member';

      const memberParticipant = new this.participantModel({
        conversationId: savedConversation._id,
        userId: memberId,
        userName: memberName,
        role: ParticipantRole.MEMBER,
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      await Promise.all([orgParticipant.save(), memberParticipant.save()]);

      conversation = savedConversation;
    }

    return conversation;
  }

  private async findConversationBetweenUsers(
    organizationId: string,
    memberId: string,
  ): Promise<Conversation | null> {
    return this.conversationModel.findOne({
      organizationId,
      memberId,
    });
  }

  private async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    const message = new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      senderId,
      content,
    });
    const savedMessage = await message.save();

    await this.conversationModel.updateOne(
      { _id: conversationId },
      { updatedAt: new Date() },
    );

    await this.participantModel.updateOne(
      {
        conversationId: new Types.ObjectId(conversationId),
        userId: { $ne: senderId },
      },
      {
        $inc: { unreadCount: 1 },
      },
    );

    console.log(`✅ Message sent in conversation ${conversationId}`);

    // TODO: Publish event to RabbitMQ for real-time notifications

    return savedMessage;
  }

  private async conversationExists(conversationId: string): Promise<any> {
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
