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
  BadRequestException,
} from '@nestjs/common';
import { SendMessageDto } from '../dto/send-message.dto';
import { ConversationsService } from '../services/conversations.service';
import { ConversationListResponse } from '../dto/conversation-list.response';
import { GetConversationsQueryDto } from '../dto/get-conversations-query.dto';
import { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { MessageListResponse } from '../dto/message-list.response';
import { CreateConversationMessageDto } from '../dto/create-conversation-message.dto';

@Controller('users/:userId')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @Param('userId') userId: string,
    @Body() dto: CreateConversationMessageDto,
  ) {
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

  @Post('conversations/:conversationId')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
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
  ) {
    const isParticipant =
      await this.conversationsService.verifyUserInConversation(
        conversationId,
        userId,
      );

    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this conversation',
      );
    }

    const conversation =
      await this.conversationsService.getConversationById(conversationId);

    return {
      id: conversation._id.toString(),
      organizationId: conversation.organizationId,
      memberId: conversation.memberId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
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
  async markAsRead(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
  ): Promise<void> {
    await this.conversationsService.markAsRead(conversationId, userId);
  }
}
