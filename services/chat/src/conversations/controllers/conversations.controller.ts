import { Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { SendMessageDto } from '../dto/send-message.dto';
import { Body } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';

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
}
