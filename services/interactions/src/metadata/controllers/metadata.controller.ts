import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MetadataService } from '../services/metadata.service';
import { RmqContext, Ctx } from '@nestjs/microservices';

@Controller()
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @MessagePattern()
  async handleEvent(@Payload() payload: any, @Ctx() context: RmqContext) {
    const msg = context.getMessage();
    const routingKey = msg.fields.routingKey;

    console.log('📥 Message received:', routingKey);

    if (routingKey === 'event.published') {
      await this.metadataService.handleEventPublished(payload);
    }

    const channel = context.getChannelRef();
    channel.ack(msg);
  }
}
