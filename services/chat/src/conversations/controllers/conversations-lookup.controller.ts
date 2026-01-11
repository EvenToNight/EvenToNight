import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';
import { ConversationDetailDTO } from '../dto/conversation-details.dto';

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
}
