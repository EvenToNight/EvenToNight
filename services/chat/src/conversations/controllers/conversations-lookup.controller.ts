import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';
import { ConversationDetailDTO } from '../dto/conversation-details.dto';
import { MessageListResponse } from '../dto/message-list.response';
import { GetMessagesQueryDto } from '../dto/get-messages-query.dto';

@Controller('conversations')
export class ConversationsLookupController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get(':organizationId/:memberId')
  async getConversationByUsers(
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
  ): Promise<ConversationDetailDTO> {
    const conversation = await this.conversationsService.getConversationByUsers(
      organizationId,
      memberId,
    );

    return conversation;
  }

  @Get(':organizationId/:memberId/messages')
  async getMessages(
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
    @Query() query: GetMessagesQueryDto,
  ): Promise<MessageListResponse> {
    return this.conversationsService.getConversationWithMessagesByUsers(
      organizationId,
      memberId,
      query,
    );
  }
}
