import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MetadataService } from '../services/metadata.service';
import { RmqContext, Ctx } from '@nestjs/microservices';
import { EventPublishedDto } from '../dto/event-published.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserCreatedDto } from '../dto/user-created.dto';

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

    this.logger.log(`Payload: ${JSON.stringify(payload)}`);

    try {
      switch (routingKey) {
        case 'event.published':
          await this.handleEventPublished(payload);
          break;
        case 'user.created':
          await this.handleUserCreated(payload);
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

  private async handleUserCreated(payload: unknown): Promise<void> {
    const dto = await this.validateAndTransform(UserCreatedDto, payload);
    await this.metadataService.handleUserCreated(dto);
  }

  private async validateAndTransform<T extends object>(
    dtoClass: new () => T,
    payload: unknown,
  ): Promise<T> {
    // Estrai il payload dalla struttura EventEnvelope
    let actualPayload = payload;

    if (this.isEventEnvelope(payload)) {
      this.logger.debug('Extracting payload from EventEnvelope');
      actualPayload = payload.payload;

      // Estrai il payload annidato (es. UserCreated, EventPublished, etc.)
      if (actualPayload && typeof actualPayload === 'object') {
        const nestedKeys = Object.keys(actualPayload);
        if (nestedKeys.length === 1) {
          const nestedKey = nestedKeys[0];
          this.logger.debug(`Extracting nested payload from key: ${nestedKey}`);
          actualPayload = (actualPayload as Record<string, unknown>)[nestedKey];
        }
      }
    }

    // Trasforma il payload nel DTO
    const dtoInstance = plainToInstance(dtoClass, actualPayload, {
      excludeExtraneousValues: false,
      exposeUnsetFields: false,
    });

    // Valida il DTO
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: false, // Permetti campi extra, li ignoriamo
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    return dtoInstance;
  }

  private isEventEnvelope(payload: unknown): payload is {
    eventType: string;
    occurredAt: string;
    payload: unknown;
  } {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'eventType' in payload &&
      'payload' in payload
    );
  }
}
