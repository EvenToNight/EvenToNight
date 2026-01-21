import { Controller, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { UsersService } from '../services/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller()
export class UserConsumer {
  private readonly logger = new Logger(UserConsumer.name);

  constructor(
    private readonly usersService: UsersService,
    @InjectModel('Participant') private participantModel: Model<any>,
  ) {}

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
        case 'user.created':
          await this.handleUserCreated(payload);
          break;
        case 'user.updated':
          await this.handleUserUpdated(payload);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(payload);
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

  private async handleUserCreated(payload: any): Promise<void> {
    this.logger.log('Processing user.created event');

    const userData = payload.payload;

    if (!userData || !userData.id) {
      throw new Error('User data not found in payload or missing id');
    }

    await this.usersService.upsertUser({
      id: userData.id,
      role: userData.role,
      name: userData.name,
      avatar: userData.avatar,
    });

    this.logger.log(`✅ User created/cached: ${userData.id}`);
  }

  private async handleUserUpdated(payload: any): Promise<void> {
    this.logger.log('Processing user.updated event');

    const userData = payload.payload;

    if (!userData || !userData.id) {
      throw new Error('User data not found in payload or missing id');
    }

    const updates: { name?: string; avatar?: string } = {};
    if (userData.name !== undefined) updates.name = userData.name;
    if (userData.avatar !== undefined) updates.avatar = userData.avatar;

    const result = await this.usersService.updateUser(userData.id, updates);

    if (userData.name !== undefined) {
      await this.participantModel.updateMany(
        { userId: userData.id },
        { $set: { userName: userData.name } },
      );
      this.logger.log(`✅ Updated userName in participants for ${userData.id}`);
    }

    if (result) {
      this.logger.log(`✅ User updated successfully: ${userData.id}`);
    } else {
      this.logger.warn(`⚠️ User not found for update: ${userData.id}`);
    }
  }

  private async handleUserDeleted(payload: any): Promise<void> {
    this.logger.log('Processing user.deleted event');

    const userData = payload.payload;

    if (!userData || !userData.id) {
      throw new Error('User data not found in payload or missing id');
    }

    await this.usersService.deleteUser(userData.id);

    this.logger.log(`✅ User deleted successfully: ${userData.id}`);
  }
}
