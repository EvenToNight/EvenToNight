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
import { MarkAsReadDto } from '../dto/mark-as-read.dto';
import { CreateConversationMessageDto } from '../dto/create-conversation-message.dto';

@Controller('messages')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post(':userId/conversations')
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

  @Post(':organizationId/:memberId/')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const message = await this.conversationsService.sendMessage(
      organizationId,
      memberId,
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

  @Get(':userId')
  async getUserConversations(
    @Param('userId') userId: string,
    @Query() query: GetConversationsQueryDto,
  ): Promise<ConversationListResponse> {
    return await this.conversationsService.getUserConversations(userId, query);
  }

  @Get(':userId/unread/count')
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.conversationsService.getTotalUnreadCount(userId);

    return {
      unreadCount: count,
    };
  }

  @Get(':userId/:conversationId')
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

  @Get(':userId/:conversationId/messages')
  async getMessages(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    return this.conversationsService.getMessages(conversationId, userId, query);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @Param('id') conversationId: string,
    @Body() markAsReadDto: MarkAsReadDto,
  ): Promise<void> {
    await this.conversationsService.markAsRead(
      conversationId,
      markAsReadDto.userId,
    );
  }
}
