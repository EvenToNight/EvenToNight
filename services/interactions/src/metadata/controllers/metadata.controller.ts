import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MetadataService } from '../services/metadata.service';
import { RmqContext, Ctx } from '@nestjs/microservices';
import { EventPublishedDto } from '../dto/event-published.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

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
          await this.handleEventPublished(payload);
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

  private async handleEventPublished(payload: unknown): Promise<void> {
    const dto = await this.validateAndTransform(EventPublishedDto, payload);
    await this.metadataService.handleEventPublished(dto);
  }

  private async validateAndTransform<T extends object>(
    dtoClass: new () => T,
    payload: unknown,
  ): Promise<T> {
    let dataToValidate = payload;

    if (typeof payload === 'object' && payload !== null) {
      const payloadObj = payload as Record<string, unknown>;

      const payloadKey = Object.keys(payloadObj).find(
        (key) => key.charAt(0) === key.charAt(0).toUpperCase(),
      );

      if (payloadKey && payloadObj[payloadKey]) {
        this.logger.debug(`Extracting payload from key: ${payloadKey}`);
        dataToValidate = payloadObj[payloadKey];
      }
    }

    const dtoInstance = plainToInstance(dtoClass, dataToValidate);

    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    return dtoInstance;
  }
}
