import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Conversation } from '../schemas/conversation.schema';
import { ParticipantRole } from '../schemas/participant.schema';
import { Message, MessageDocument } from '../schemas/message.schema';

import { CreateConversationMessageDto } from '../dto/create-conversation-message.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { GetConversationsQueryDto } from '../dto/get-conversations-query.dto';
import { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { SearchConversationsQueryDto } from '../dto/search-conversation-query.dto';
import { ConversationListResponse } from '../dto/conversation-list.response';
import { ConversationListItemDTO } from '../dto/conversation-list-item.dto';
import { ConversationDetailDTO } from '../dto/conversation-details.dto';
import { MessageListResponse } from '../dto/message-list.response';
import { MessageDTO } from '../dto/message.dto';

import { UsersService } from '../../users/services/users.service';
import { UserRole } from '../../users/schemas/user.schema';
import { UserID } from '../types';

@Injectable()
export class ConversationsService {
  private readonly DEFAULT_AVATAR =
    'https://media.eventonight.site/users/default.jpg';

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<any>,
    @InjectModel('Participant') private readonly participantModel: Model<any>,
    @InjectModel(Message.name) private readonly messageModel: Model<any>,
    private readonly usersService: UsersService,
  ) {}

  async createConversationWithMessage(
    senderId: string,
    dto: CreateConversationMessageDto,
  ): Promise<MessageDocument> {
    await this.ensureConversationDoesNotExist(dto.recipientId, senderId);

    const conversation = await this.findOrCreateConversation(
      senderId,
      dto.recipientId,
    );

    return this.createMessage(
      conversation._id.toString(),
      senderId,
      dto.content,
    );
  }

  async sendMessageToConversation(
    senderId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    await this.validateConversationExists(conversationId);
    await this.validateUserIsParticipant(conversationId, senderId);
    return this.createMessage(conversationId, senderId, dto.content);
  }

  async getUserConversations(
    userId: string,
    query: GetConversationsQueryDto,
  ): Promise<ConversationListResponse> {
    await this.validateUserExists(userId);

    const { limit = 20, offset = 0 } = query;

    const participants = await this.fetchUserParticipants(
      userId,
      limit,
      offset,
    );

    const hasMore = participants.length > limit;
    const items = participants.slice(0, limit);

    const conversations = await this.buildConversationListItems(items);

    return { items: conversations, limit, offset, hasMore };
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    await this.validateUserExists(userId);
    const participants = await this.participantModel.find({ userId });
    return participants.reduce((total, p) => total + p.unreadCount, 0);
  }

  async getConversationById(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDetailDTO> {
    this.validateObjectId(conversationId);

    const conversation = await this.findConversationOrThrow(conversationId);

    await this.validateUserIsParticipant(conversationId, userId);

    return this.buildConversationDetail(conversation);
  }

  async getMessages(
    conversationId: string,
    userId: string,
    query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    await this.validateUserExists(userId);
    await this.validateUserIsParticipant(conversationId, userId);
    const { limit = 50, offset = 0 } = query;
    const participant = await this.findParticipant(conversationId, userId);

    const messages = await this.fetchMessages(conversationId, limit, offset);
    const hasMore = messages.length > limit;
    const items = messages.slice(0, limit);

    const messageDTOs = await this.buildMessageDTOs(
      items,
      conversationId,
      participant,
    );

    this.markAsReadAsync(conversationId, userId);

    return { items: messageDTOs, limit, offset, hasMore };
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.validateUserIsParticipant(conversationId, userId);

    await this.participantModel.updateOne(
      { conversationId: new Types.ObjectId(conversationId), userId },
      { lastReadAt: new Date(), unreadCount: 0 },
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

    return this.buildConversationDetail(conversation);
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

    return this.getMessages(conversation._id, memberId, query);
  }

  async searchConversationWithFilters(
    userId: string,
    query: SearchConversationsQueryDto,
  ): Promise<ConversationListResponse> {
    await this.validateUserExists(userId);

    const { limit = 20, offset = 0, name, recipientId } = query;
    const hasFilters = Boolean(name || recipientId);

    let conversationIds: Types.ObjectId[] | null = null;

    if (hasFilters) {
      conversationIds = await this.findFilteredConversationIds(
        userId,
        name,
        recipientId,
      );

      if (conversationIds.length === 0 && offset === 0) {
        return this.getSuggestedUsers(userId, {
          limit: Number(limit),
          offset: 0,
          name,
          recipientId,
        });
      }
    }

    const participants = await this.fetchFilteredParticipants(
      userId,
      conversationIds,
      Number(limit),
      Number(offset),
    );

    const hasMore = participants.length > Number(limit);
    const items = participants.slice(0, Number(limit));

    const conversations = await this.buildSearchResults(items, userId);
    const validConversations = conversations.filter(
      (c): c is ConversationListItemDTO => c !== null,
    );

    if (offset === 0) {
      await this.addSuggestionsIfNeeded(
        validConversations,
        userId,
        Number(limit),
        name,
        recipientId,
      );
    }

    return {
      items: validConversations,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: hasMore || validConversations.length === Number(limit),
    };
  }

  async verifyUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    await this.validateUserExists(userId);
    const participant = await this.participantModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId,
    });
    return !!participant;
  }

  private async validateUserExists(userId: string): Promise<void> {
    const exists = await this.usersService.userExists(userId);
    if (!exists) {
      throw new BadRequestException(`User ${userId} does not exist`);
    }
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid conversation ID');
    }
  }

  private async validateConversationExists(
    conversationId: string,
  ): Promise<any> {
    this.validateObjectId(conversationId);
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  private async validateUserIsParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const isParticipant = await this.verifyUserInConversation(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this conversation',
      );
    }
  }

  private async ensureConversationDoesNotExist(
    recipientId: string,
    senderId: string,
  ): Promise<void> {
    const existing = await this.findConversationBetweenUsers(
      recipientId,
      senderId,
    );
    if (existing) {
      throw new BadRequestException(
        'Conversation already exists. Use the existing conversation endpoint.',
      );
    }
  }

  private async findConversationOrThrow(conversationId: string): Promise<any> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  private async findParticipant(
    conversationId: string,
    userId: string,
  ): Promise<any> {
    return this.participantModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId,
    });
  }

  private async fetchUserParticipants(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    return this.participantModel
      .find({ userId })
      .populate('conversationId')
      .sort({ 'conversationId.updatedAt': -1 })
      .skip(offset)
      .limit(limit + 1)
      .exec();
  }

  private async fetchMessages(
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

  private async fetchFilteredParticipants(
    userId: string,
    conversationIds: Types.ObjectId[] | null,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    const filter: any = { userId };

    if (conversationIds) {
      filter.conversationId = { $in: conversationIds };
    }

    return this.participantModel
      .find(filter)
      .populate('conversationId')
      .sort({ 'conversationId.updatedAt': -1 })
      .skip(offset)
      .limit(limit + 1)
      .exec();
  }

  private async findFilteredConversationIds(
    userId: string,
    name?: string,
    recipientId?: string,
  ): Promise<Types.ObjectId[]> {
    const partnerQuery: any = { userId: { $ne: userId } };

    if (name) {
      partnerQuery.userName = { $regex: name, $options: 'i' };
    }

    if (recipientId) {
      partnerQuery.userId = { $regex: `^${recipientId}`, $options: 'i' };
    }

    const partners = await this.participantModel
      .find(partnerQuery)
      .select('conversationId')
      .exec();

    return partners.map((p) => p.conversationId);
  }

  private async buildConversationListItems(
    participants: any[],
  ): Promise<ConversationListItemDTO[]> {
    return Promise.all(
      participants.map(async (participant) => {
        const conversation = participant.conversationId;
        const lastMessage = await this.findLastMessage(conversation._id);
        const [orgInfo, memberInfo] = await this.fetchUsersInfo(
          conversation.organizationId,
          conversation.memberId,
        );

        return {
          id: conversation._id.toString(),
          organization: this.buildUserInfo(
            conversation.organizationId,
            orgInfo,
          ),
          member: this.buildUserInfo(conversation.memberId, memberInfo),
          lastMessage: this.buildLastMessageInfo(lastMessage),
          unreadCount: participant.unreadCount,
        };
      }),
    );
  }

  private async buildConversationDetail(
    conversation: any,
  ): Promise<ConversationDetailDTO> {
    const [orgInfo, memberInfo] = await this.fetchUsersInfo(
      conversation.organizationId,
      conversation.memberId,
    );

    return {
      id: conversation._id.toString(),
      organization: this.buildUserInfo(conversation.organizationId, orgInfo),
      member: this.buildUserInfo(conversation.memberId, memberInfo),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private async buildMessageDTOs(
    messages: any[],
    conversationId: string,
    participant: any,
  ): Promise<MessageDTO[]> {
    const senderIds = [...new Set(messages.map((msg) => msg.senderId))];
    const usersInfo = await this.fetchMultipleUsersInfo(senderIds);
    const usersMap = new Map(usersInfo.map((user) => [user.userId, user]));

    return messages.map((message) => {
      const senderInfo = usersMap.get(message.senderId);

      return {
        id: message._id.toString(),
        conversationId,
        sender: {
          id: message.senderId,
          name: senderInfo?.name || 'Unknown User',
          avatar: senderInfo?.avatar || this.DEFAULT_AVATAR,
        },
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.createdAt <= participant.lastReadAt,
      };
    });
  }

  private async buildSearchResults(
    participants: any[],
    userId: string,
  ): Promise<(ConversationListItemDTO | null)[]> {
    return Promise.all(
      participants.map(async (participant) => {
        const conversation = participant.conversationId;
        if (!conversation) return null;

        const lastMessage = await this.findLastMessage(conversation._id);
        const partnerParticipant = await this.findPartnerParticipant(
          conversation._id,
          userId,
        );

        if (!partnerParticipant) return null;

        const [myUserInfo, partnerUserInfo] = await this.fetchUsersInfo(
          userId,
          partnerParticipant.userId,
        );

        return this.buildSearchResultItem(
          conversation,
          participant,
          partnerParticipant,
          myUserInfo,
          partnerUserInfo,
          lastMessage,
          userId,
        );
      }),
    );
  }

  private buildSearchResultItem(
    conversation: any,
    participant: any,
    partnerParticipant: any,
    myUserInfo: any,
    partnerUserInfo: any,
    lastMessage: any,
    userId: string,
  ): ConversationListItemDTO {
    const isPartnerOrganization =
      partnerParticipant.role === ParticipantRole.ORGANIZATION;

    return {
      id: conversation._id.toString(),
      organization: isPartnerOrganization
        ? {
            id: partnerParticipant.userId,
            name: partnerParticipant.userName,
            avatar: partnerUserInfo?.avatar || this.DEFAULT_AVATAR,
          }
        : {
            id: userId,
            name: participant.userName,
            avatar: myUserInfo?.avatar || this.DEFAULT_AVATAR,
          },
      member: !isPartnerOrganization
        ? {
            id: partnerParticipant.userId,
            name: partnerParticipant.userName,
            avatar: partnerUserInfo?.avatar || this.DEFAULT_AVATAR,
          }
        : {
            id: userId,
            name: participant.userName,
            avatar: myUserInfo?.avatar || this.DEFAULT_AVATAR,
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
  }

  private async addSuggestionsIfNeeded(
    conversations: ConversationListItemDTO[],
    userId: string,
    limit: number,
    name?: string,
    recipientId?: string,
  ): Promise<void> {
    const remainingSlots = limit - conversations.length;

    if (remainingSlots <= 0) return;

    const suggestedResult = await this.getSuggestedUsers(userId, {
      limit: remainingSlots,
      offset: 0,
      name,
      recipientId,
    });

    const existingPartnerIds = this.extractPartnerIds(conversations, userId);
    const newSuggestions = this.filterExistingSuggestions(
      suggestedResult.items,
      existingPartnerIds,
      userId,
    );

    conversations.push(...newSuggestions.slice(0, remainingSlots));
  }

  private extractPartnerIds(
    conversations: ConversationListItemDTO[],
    userId: string,
  ): Set<string> {
    return new Set(
      conversations.map((c) =>
        c.organization.id === userId ? c.member.id : c.organization.id,
      ),
    );
  }

  private filterExistingSuggestions(
    items: ConversationListItemDTO[],
    existingPartnerIds: Set<string>,
    userId: string,
  ): ConversationListItemDTO[] {
    return items.filter((item) => {
      const partnerId =
        item.organization.id === userId ? item.member.id : item.organization.id;
      return !existingPartnerIds.has(partnerId);
    });
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

    const targetRole = this.getOppositeRole(currentRole);

    const suggestedUsers = await this.searchTargetUsers(
      userId,
      targetRole,
      options,
    );
    const limitedUsers = this.applyPagination(
      suggestedUsers,
      options.limit,
      options.offset,
    );

    const hasMore = limitedUsers.length > options.limit;
    const items = limitedUsers.slice(0, options.limit);

    const suggestions = await this.buildSuggestions(items, userId);

    return {
      items: suggestions,
      limit: options.limit,
      offset: options.offset,
      hasMore,
    };
  }

  private getOppositeRole(role: UserRole): UserRole {
    return role === UserRole.MEMBER ? UserRole.ORGANIZATION : UserRole.MEMBER;
  }

  private async searchTargetUsers(
    userId: string,
    targetRole: UserRole,
    options: { name?: string; recipientId?: string },
  ): Promise<any[]> {
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

    return this.usersService.searchUsers(userQuery);
  }

  private applyPagination<T>(items: T[], limit: number, offset: number): T[] {
    return items.slice(offset, offset + limit + 1);
  }

  private async buildSuggestions(
    users: any[],
    userId: string,
  ): Promise<ConversationListItemDTO[]> {
    const myUserInfo = await this.usersService.getUserInfo(userId);

    return users.map((user) => ({
      id: '',
      organization: this.buildSuggestionUserInfo(
        user,
        UserRole.ORGANIZATION,
        userId,
        myUserInfo,
      ),
      member: this.buildSuggestionUserInfo(
        user,
        UserRole.MEMBER,
        userId,
        myUserInfo,
      ),
      lastMessage: null,
      unreadCount: 0,
    }));
  }

  private buildSuggestionUserInfo(
    user: any,
    roleToMatch: UserRole,
    currentUserId: string,
    currentUserInfo: any,
  ) {
    const isMatch = user.role === roleToMatch;

    return isMatch
      ? {
          id: user.userId,
          name: user.name || 'Unknown',
          avatar: user.avatar || this.DEFAULT_AVATAR,
        }
      : {
          id: currentUserId,
          name: currentUserInfo?.name || 'Unknown',
          avatar: currentUserInfo?.avatar || this.DEFAULT_AVATAR,
        };
  }

  private async determineRoles(
    userId1: UserID,
    userId2: UserID,
  ): Promise<{ organizationId: string; memberId: string }> {
    const [user1Info, user2Info] = await this.fetchUsersInfo(userId1, userId2);

    if (!user1Info) {
      throw new BadRequestException(`User ${userId1} does not exist`);
    }
    if (!user2Info) {
      throw new BadRequestException(`User ${userId2} does not exist`);
    }

    const isUser1Org = user1Info.role === UserRole.ORGANIZATION;
    const isUser2Org = user2Info.role === UserRole.ORGANIZATION;
    const isUser1Member = user1Info.role === UserRole.MEMBER;
    const isUser2Member = user2Info.role === UserRole.MEMBER;

    if (isUser1Org && isUser2Member) {
      return { organizationId: userId1, memberId: userId2 };
    }

    if (isUser1Member && isUser2Org) {
      return { organizationId: userId2, memberId: userId1 };
    }

    throw new BadRequestException(
      'Conversation must be between an organization and a member',
    );
  }

  private async findLastMessage(conversationId: Types.ObjectId): Promise<any> {
    return this.messageModel
      .findOne({ conversationId })
      .sort({ createdAt: -1 })
      .select('content senderId createdAt')
      .exec();
  }

  private async findPartnerParticipant(
    conversationId: Types.ObjectId,
    userId: string,
  ): Promise<any> {
    return this.participantModel
      .findOne({
        conversationId,
        userId: { $ne: userId },
      })
      .select('userId userName role')
      .exec();
  }

  private async fetchUsersInfo(
    userId1: string,
    userId2: string,
  ): Promise<[any, any]> {
    return Promise.all([
      this.usersService.getUserInfo(userId1),
      this.usersService.getUserInfo(userId2),
    ]);
  }

  private async fetchMultipleUsersInfo(userIds: string[]): Promise<any[]> {
    return Promise.all(
      userIds.map(async (id) => {
        const user = await this.usersService.getUserInfo(id);
        return (
          user || {
            userId: id,
            name: 'Unknown User',
            avatar: this.DEFAULT_AVATAR,
          }
        );
      }),
    );
  }

  private buildUserInfo(userId: string, userInfo: any) {
    return {
      id: userId,
      name: userInfo?.name || 'Unknown',
      avatar: userInfo?.avatar || this.DEFAULT_AVATAR,
    };
  }

  private buildLastMessageInfo(lastMessage: any) {
    return lastMessage
      ? {
          content: lastMessage.content,
          senderId: String(lastMessage.senderId),
          timestamp: lastMessage.createdAt,
        }
      : {
          content: '',
          senderId: '',
          timestamp: new Date(0),
        };
  }

  private async markAsReadAsync(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.markAsRead(conversationId, userId).catch((err) => {
      console.error(
        `Failed to mark messages as read for user ${userId} in conversation ${conversationId}:`,
        err,
      );
    });
  }

  private async findOrCreateConversation(
    userId1: string,
    userId2: string,
  ): Promise<any> {
    // TODO: implement real roles assignments
    // const {organizationId, memberId} = await this.determineRoles(userId1, userId2);
    const organizationId = userId2;
    const memberId = userId1;

    let conversation = await this.findConversationBetweenUsers(
      organizationId,
      memberId,
    );

    if (!conversation) {
      conversation = await this.createNewConversation(organizationId, memberId);
    }

    return conversation;
  }

  private async createNewConversation(
    organizationId: string,
    memberId: string,
  ): Promise<any> {
    const conversation = await new this.conversationModel({
      organizationId,
      memberId,
    }).save();

    await this.createParticipantsForConversation(
      conversation._id,
      organizationId,
      memberId,
    );

    return conversation;
  }

  private async createParticipantsForConversation(
    conversationId: Types.ObjectId,
    organizationId: string,
    memberId: string,
  ): Promise<void> {
    const [orgName, memberName] = await Promise.all([
      this.usersService.getUsername(organizationId),
      this.usersService.getUsername(memberId),
    ]);

    const orgParticipant = new this.participantModel({
      conversationId,
      userId: organizationId,
      userName: orgName || 'Organization',
      role: ParticipantRole.ORGANIZATION,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    const memberParticipant = new this.participantModel({
      conversationId,
      userId: memberId,
      userName: memberName || 'Member',
      role: ParticipantRole.MEMBER,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    await Promise.all([orgParticipant.save(), memberParticipant.save()]);
  }

  private async findConversationBetweenUsers(
    organizationId: string,
    memberId: string,
  ): Promise<Conversation | null> {
    return this.conversationModel.findOne({ organizationId, memberId });
  }

  private async createMessage(
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

    // TODO: Publish event to RabbitMQ for real-time notifications

    return message;
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
