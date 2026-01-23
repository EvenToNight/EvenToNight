import { Controller, Inject, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import type { EventEnvelope } from '../../../commons/domain/events/event-envelope';
import {
  USER_REPOSITORY,
  type UserRepository,
} from 'src/tickets/domain/repositories/user.repository.interface';
import { User } from 'src/tickets/domain/aggregates/user.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { Channel } from 'amqp-connection-manager';
import { Message } from 'amqplib';

interface UserPayload {
  id: string;
  language: string;
}

interface UserDeletedPayload {
  id: string;
}

@Controller()
export class UserEventConsumer {
  private readonly logger = new Logger(UserEventConsumer.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  @MessagePattern()
  async handleAllEvents(
    @Payload() envelope: EventEnvelope<any>,
    @Ctx() context: RmqContext,
  ) {
    const message = context.getMessage() as Message;
    const routingKey = message.fields.routingKey;
    this.logger.log(`📨 Received event: ${routingKey}`);
    this.logger.debug(`Payload: ${JSON.stringify(envelope?.payload)}`);
    const channel = context.getChannelRef() as Channel;

    try {
      switch (routingKey) {
        case 'user.created':
          await this.handleUserCreated(envelope as EventEnvelope<UserPayload>);
          break;
        case 'user.updated':
          await this.handleUserUpdated(envelope as EventEnvelope<UserPayload>);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(
            envelope as EventEnvelope<UserDeletedPayload>,
          );
          break;
        default:
          this.logger.warn(`Unknown routing key: ${routingKey}`);
      }
      channel.ack(message);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to process ${routingKey}: ${error.message}`,
          error.stack,
        );
      }
      channel.nack(message, false, false);
    }
  }

  private async handleUserCreated(envelope: EventEnvelope<UserPayload>) {
    this.logger.log(
      `Processing user.created: ${JSON.stringify(envelope.payload)}`,
    );
    try {
      await this.userRepository.save(
        User.create(
          UserId.fromString(envelope.payload.id),
          envelope.payload.language,
        ),
      );

      this.logger.log(`User created: ${envelope.payload.id}`);
    } catch (err: unknown) {
      if (this.userRepository.isDuplicateError(err)) {
        this.logger.warn(
          `User with id ${envelope.payload.id} already exists. Skipping creation.`,
        );
        return;
      }
      throw err;
    }
  }

  private async handleUserUpdated(envelope: EventEnvelope<UserPayload>) {
    this.logger.log(`Processing user.updated: ${envelope.payload.id}`);

    await this.userRepository.update(
      User.create(
        UserId.fromString(envelope.payload.id),
        envelope.payload.language,
      ),
    );

    this.logger.log(`User updated: ${envelope.payload.id}`);
  }

  private async handleUserDeleted(envelope: EventEnvelope<UserDeletedPayload>) {
    this.logger.log(`Processing user.deleted: ${envelope.payload.id}`);

    await this.userRepository.delete(envelope.payload.id);

    this.logger.log(`User deleted: ${envelope.payload.id}`);
  }
}
