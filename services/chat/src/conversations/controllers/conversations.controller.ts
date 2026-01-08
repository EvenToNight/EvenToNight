import { Controller, Get } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { SendMessageDto } from '../dto/send-message.dto';
import { Body } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';
import { ConversationListResponse } from '../dto/conversation-list.response';
import { Query } from '@nestjs/common';
import { GetConversationsQueryDto } from '../dto/get-conversations-query.dto';

@Controller('messages')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

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
}
