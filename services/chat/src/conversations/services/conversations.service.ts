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

import { UsersService } from '../../users/services/users.service';
import { UserRole } from '../../users/schemas/user.schema';
import { UserID } from '../types';
import { DataMapperService } from './data-mapper.service';
import { MessageManagerService } from './message-manager.service';

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
    private readonly dataMapperService: DataMapperService,
    private readonly messageManagerService: MessageManagerService,
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

    return this.messageManagerService.createMessage(
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
    return this.messageManagerService.createMessage(
      conversationId,
      senderId,
      dto.content,
    );
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

    const conversations =
      await this.dataMapperService.buildConversationListItems(items);

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

    return this.dataMapperService.buildConversationDetail(conversation);
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

    const messages = await this.messageManagerService.fetchMessages(
      conversationId,
      limit,
      offset,
    );
    const hasMore = messages.length > limit;
    const items = messages.slice(0, limit);

    const messageDTOs = await this.dataMapperService.buildMessageDTOs(
      items,
      conversationId,
      participant,
    );

    this.messageManagerService.markAsReadAsync(conversationId, userId);

    return { items: messageDTOs, limit, offset, hasMore };
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

    return this.dataMapperService.buildConversationDetail(conversation);
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

        return this.dataMapperService.buildSearchResultItem(
          conversation,
          participant,
          partnerParticipant,
          lastMessage,
          userId,
        );
      }),
    );
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

    const suggestions = await this.dataMapperService.buildSuggestions(
      items,
      userId,
    );

    console.log('Get suggested users', suggestions);

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

  private async determineRoles(
    userId1: UserID,
    userId2: UserID,
  ): Promise<{ organizationId: string; memberId: string }> {
    const [user1Info, user2Info] = await this.dataMapperService.fetchUsersInfo(
      userId1,
      userId2,
    );

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
}
