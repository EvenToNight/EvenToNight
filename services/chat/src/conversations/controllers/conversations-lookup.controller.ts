import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';
import { ConversationDetailDTO } from '../dto/conversation-details.dto';
import { MessageListResponse } from '../dto/message-list.response';
import { GetMessagesQueryDto } from '../dto/get-messages-query.dto';

@Controller('conversations')
export class ConversationsLookupController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get(':organizationId/:userId')
  async getConversationByUsers(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ): Promise<ConversationDetailDTO> {
    const conversation = await this.conversationsService.getConversationByUsers(
      organizationId,
      userId,
    );

    return conversation;
  }

  @Get(':organizationId/:userId/messages')
  async getMessages(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @Query() query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    return this.conversationsService.getConversationWithMessagesByUsers(
      organizationId,
      userId,
      query,
    );
  }
}
