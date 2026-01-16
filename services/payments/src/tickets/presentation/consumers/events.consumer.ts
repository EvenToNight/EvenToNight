import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { EventEnvelope } from '../../../commons/domain/events/event-envelope';
import {
  USER_REPOSITORY,
  type UserRepository,
} from 'src/tickets/domain/repositories/user.repository.interface';
import { User } from 'src/tickets/domain/aggregates/user.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';

//TODO: Define payload interfaces for each event, interfaces can contain only relevant fields of the real message?
interface UserPayload {
  id: string;
  language: string;
}

interface UserDeletedPayload {
  id: string;
}

/**
 * Events Consumer - Handles events from other microservices via RabbitMQ
 *
 * This consumer listens to events published by other services (e.g., Events service)
 * and reacts accordingly. Uses @EventPattern decorator to bind to RabbitMQ routing keys.
 */
@Controller()
export class EventsConsumer {
  private readonly logger = new Logger(EventsConsumer.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}
  @EventPattern('user.created')
  @EventPattern('user.updated')
  async handleUserCreatedOrUpdated(
    @Payload() envelope: EventEnvelope<UserPayload>,
  ) {
    this.logger.log(
      `Received ${envelope.eventType}: ${JSON.stringify(envelope.payload)}`,
    );
    await this.userRepository.save(
      User.create(
        UserId.fromString(envelope.payload.id),
        envelope.payload.language,
      ),
    );
    this.logger.log(`New user created or updated: ${envelope.payload.id}`);
  }

  @EventPattern('user.deleted')
  async handleUserDeleted(
    @Payload() envelope: EventEnvelope<UserDeletedPayload>,
  ) {
    this.logger.log(
      `Received user.deleted: ${JSON.stringify(envelope.payload)}`,
    );
    await this.userRepository.delete(envelope.payload.id);
    this.logger.log(`User deleted: ${envelope.payload.id}`);
  }
}
