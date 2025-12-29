import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MetadataService } from '../services/metadata.service';
import { RmqContext, Ctx } from '@nestjs/microservices';

@Controller()
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @MessagePattern()
  async handleEvent(@Payload() payload: unknown, @Ctx() context: RmqContext) {
    const msg: unknown = context.getMessage();

    let routingKey: string | undefined;
    if (typeof msg === 'object' && msg !== null && 'fields' in msg) {
      const m = msg as { fields?: { routingKey?: string } };
      routingKey = m.fields?.routingKey;
    }

    console.log('📥 Message received:', routingKey);

    if (routingKey === 'event.published') {
      await this.metadataService.handleEventPublished(payload);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    channel.ack(msg as any);
  }
}
