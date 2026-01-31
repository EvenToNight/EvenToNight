import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SendMessageDto } from '../dto/send-message.dto';
import { ConversationsService } from '../services/conversations.service';
import { ConversationListResponse } from '../dto/conversation-list.response';
import { GetConversationsQueryDto } from '../dto/get-conversations-query.dto';
import { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { MessageListResponse } from '../dto/message-list.response';
import { CreateConversationMessageDto } from '../dto/create-conversation-message.dto';
import { ConversationListItemDTO } from '../dto/conversation-list-item.dto';
import { SearchConversationsQueryDto } from '../dto/search-conversation-query.dto';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/auth';

@Controller('users/:userId')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async createConversation(
    @Param('userId') userId: string,
    @Body() dto: CreateConversationMessageDto,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'You can only create conversations for yourself',
      );
    }
    const message =
      await this.conversationsService.createConversationWithMessage(
        userId,
        dto,
      );

    return {
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  @Get('conversations/search')
  async searchConversations(
    @Param('userId') userId: string,
    @Query() query: SearchConversationsQueryDto,
  ): Promise<ConversationListResponse> {
    return this.conversationsService.searchConversationWithFilters(
      userId,
      query,
    );
  }

  @Post('conversations/:conversationId/messages')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only send messages for yourself');
    }
    const message = await this.conversationsService.sendMessageToConversation(
      userId,
      conversationId,
      sendMessageDto,
    );

    return {
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  @Get('conversations')
  async getUserConversations(
    @Param('userId') userId: string,
    @Query() query: GetConversationsQueryDto,
  ): Promise<ConversationListResponse> {
    return await this.conversationsService.getUserConversations(userId, query);
  }

  @Get('unread/count')
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.conversationsService.getTotalUnreadCount(userId);

    return {
      unreadCount: count,
    };
  }

  @Get('conversations/:conversationId')
  async getConversation(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
  ): Promise<ConversationListItemDTO> {
    return await this.conversationsService.getConversationById(
      conversationId,
      userId,
    );
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    return this.conversationsService.getMessages(conversationId, userId, query);
  }

  @Patch('conversations/:conversationId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @CurrentUser('userId') currentUserId: string,
  ): Promise<void> {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only mark as read for yourself');
    }
    await this.conversationsService.markAsRead(conversationId, userId);
  }
}
