import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MetadataService } from '../services/metadata.service';
import { RmqContext, Ctx } from '@nestjs/microservices';

@Controller()
export class MetadataController {
  private readonly logger = new Logger(MetadataController.name);

  constructor(private readonly metadataService: MetadataService) {}

  @MessagePattern()
  async handleEvent(
    @Payload() payload: unknown,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    let routingKey: string | undefined;
    if (
      typeof originalMsg === 'object' &&
      originalMsg !== null &&
      'fields' in originalMsg
    ) {
      const msg = originalMsg as { fields?: { routingKey?: string } };
      routingKey = msg.fields?.routingKey;
    }

    this.logger.log('📥 Message received:', routingKey);

    try {
      switch (routingKey) {
        case 'event.published':
          await this.metadataService.handleEventPublished(payload);
          break;
        case 'user.registered':
          await this.metadataService.handleUserRegistered(payload);
          break;
        case 'event.deleted':
          await this.metadataService.handleEventDeleted(payload);
          break;
        case 'user.deleted':
          await this.metadataService.handleUserDeleted(payload);
          break;
        default:
          this.logger.warn(`⚠️  Unhandled routing key: ${routingKey}`);
          channel.ack(originalMsg);
          return;
      }
      channel.ack(originalMsg);
      this.logger.debug('✅ Message acknowledged');
    } catch (error) {
      this.logger.error(
        `❌ Error processing ${routingKey}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      channel.nack(originalMsg, false, false);
      this.logger.warn('⚠️  Message rejected (not requeued)');
    }
  }
}
