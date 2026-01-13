import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Conversation } from '../schemas/conversation.schema';
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

import { DataMapperService } from './data-mapper.service';
import { MessageManagerService } from './message-manager.service';
import { UserSuggestionService } from './user-suggestion.service';
import { ConversationSearchService } from './conversation.search.service';
import { ConversationManagerService } from './conversation.manager.service';

@Injectable()
export class ConversationsService {
  private readonly DEFAULT_AVATAR =
    'https://media.eventonight.site/users/default.jpg';

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<any>,
    @InjectModel('Participant') private readonly participantModel: Model<any>,
    @InjectModel(Message.name) private readonly messageModel: Model<any>,
    private readonly dataMapperService: DataMapperService,
    private readonly messageManagerService: MessageManagerService,
    private readonly userSuggestionService: UserSuggestionService,
    private readonly conversationSearchService: ConversationSearchService,
    private readonly conversationManagerService: ConversationManagerService,
  ) {}

  async createConversationWithMessage(
    senderId: string,
    dto: CreateConversationMessageDto,
  ): Promise<MessageDocument> {
    await this.conversationManagerService.ensureConversationDoesNotExist(
      dto.recipientId,
      senderId,
    );

    const conversation =
      await this.conversationManagerService.findOrCreateConversation(
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
    await this.conversationManagerService.validateConversationExists(
      conversationId,
    );
    await this.conversationManagerService.validateUserIsParticipant(
      conversationId,
      senderId,
    );
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
    await this.conversationManagerService.validateUserExists(userId);

    const { limit = 20, offset = 0 } = query;

    const participants =
      await this.conversationManagerService.fetchUserParticipants(
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
    await this.conversationManagerService.validateUserExists(userId);
    const participants = await this.participantModel.find({ userId });
    return participants.reduce((total, p) => total + p.unreadCount, 0);
  }

  async getConversationById(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDetailDTO> {
    this.conversationManagerService.validateObjectId(conversationId);

    const conversation =
      await this.conversationManagerService.findConversationOrThrow(
        conversationId,
      );

    await this.conversationManagerService.validateUserIsParticipant(
      conversationId,
      userId,
    );

    return this.dataMapperService.buildConversationDetail(conversation);
  }

  async getMessages(
    conversationId: string,
    userId: string,
    query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    await this.conversationManagerService.validateUserExists(userId);
    await this.conversationManagerService.validateUserIsParticipant(
      conversationId,
      userId,
    );
    const { limit = 50, offset = 0 } = query;
    const participant = await this.conversationManagerService.findParticipant(
      conversationId,
      userId,
    );

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

    this.markAsReadAsync(conversationId, userId);

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
    await this.conversationManagerService.validateUserExists(userId);

    const { limit = 20, offset = 0, name, recipientId } = query;
    const hasFilters = Boolean(name || recipientId);

    let conversationIds: Types.ObjectId[] | null = null;

    if (hasFilters) {
      conversationIds =
        await this.conversationSearchService.findFilteredConversationIds(
          userId,
          name,
          recipientId,
        );

      if (conversationIds.length === 0 && offset === 0) {
        return this.userSuggestionService.getSuggestedUsers(userId, {
          limit: Number(limit),
          offset: 0,
          name,
          recipientId,
        });
      }
    }

    const participants =
      await this.conversationSearchService.fetchFilteredParticipants(
        userId,
        conversationIds,
        Number(limit),
        Number(offset),
      );

    const hasMore = participants.length > Number(limit);
    const items = participants.slice(0, Number(limit));

    const conversations =
      await this.conversationSearchService.buildSearchResults(items, userId);
    const validConversations = conversations.filter(
      (c): c is ConversationListItemDTO => c !== null,
    );

    if (offset === 0) {
      await this.userSuggestionService.addSuggestionsIfNeeded(
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

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.participantModel.updateOne(
      { conversationId: new Types.ObjectId(conversationId), userId },
      { lastReadAt: new Date(), unreadCount: 0 },
    );
  }

  async markAsReadAsync(conversationId: string, userId: string): Promise<void> {
    await this.markAsRead(conversationId, userId).catch((err) => {
      console.error(
        `Failed to mark messages as read for user ${userId} in conversation ${conversationId}:`,
        err,
      );
    });
  }
}
