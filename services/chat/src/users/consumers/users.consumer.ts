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
          await this.handleUserCreated(payload, context);
          break;
        case 'user.updated':
          await this.handleUserUpdated(payload, context);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(payload, context);
          break;
        default:
          this.logger.warn(`No handler for routing key: ${routingKey}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing message with routing key ${routingKey}:`,
        error,
      );
    }
  }

  async handleUserCreated(data: any, context: RmqContext) {
    console.log('Received user.created event:', data);

    try {
      // Estrai i dati dell'utente dalla struttura nidificata
      const userData = data.payload?.UserCreated;

      if (!userData) {
        this.logger.error('UserCreated data not found in payload');
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg); // Ack comunque per non bloccare la coda
        return;
      }

      await this.usersService.upsertUser({
        id: userData.id,
        role: userData.role,
        name: userData.name,
        avatar: userData.avatar,
      });

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);

      this.logger.log(`✅ User created/cached: ${userData.id}`);
    } catch (error) {
      this.logger.error('Error caching user:', error);
    }
  }

  async handleUserUpdated(data: any, context: RmqContext) {
    console.log('Received user.updated event:', data);

    try {
      const updates: { name?: string; avatar?: string } = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.avatar !== undefined) updates.avatar = data.avatar;

      const result = await this.usersService.updateUser(data.id, updates);

      if (data.name !== undefined) {
        await this.participantModel.updateMany(
          { userId: data.id },
          { $set: { userName: data.name } },
        );
        console.log(`✅ Updated userName in participants for ${data.id}`);
      }

      if (result) {
        console.log('✅ User updated successfully:', data.id);
      } else {
        console.warn('⚠️ User not found for update:', data.id);
      }

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async handleUserDeleted(data: any, context: RmqContext) {
    console.log('Received user.deleted event:', data);

    try {
      const userData = data.payload?.UserDeleted;

      if (!userData) {
        this.logger.error('UserDeleted data not found in payload');
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg); // Ack comunque per non bloccare la coda
        return;
      }

      await this.usersService.deleteUser(userData.id);

      console.log('User deleted successfully:', userData.id);

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}
